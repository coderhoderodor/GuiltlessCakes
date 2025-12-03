/**
 * Admin Order API - Individual CRUD Operations
 *
 * GET    /api/admin/orders/[id]           - Get a specific order
 * PUT    /api/admin/orders/[id]           - Update an order
 * DELETE /api/admin/orders/[id]           - Delete an order (only canceled)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOrderService } from '@/lib/services';
import { validate, updateOrderSchema } from '@/lib/validation';
import { verifyAdmin, isAdminAuthError } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if (isAdminAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const orderService = createOrderService(auth.supabase);
    const order = await orderService.getOrder(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if (isAdminAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    // Validate request body
    const validation = validate(updateOrderSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const orderService = createOrderService(auth.supabase);
    const order = await orderService.updateOrder(id, validation.data!);

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Failed to update order:', error);
    const message = error instanceof Error ? error.message : '';
    // Only expose expected business logic messages, not internal errors
    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (message.includes('Cannot transition')) {
      return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if (isAdminAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const orderService = createOrderService(auth.supabase);
    await orderService.deleteOrder(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete order:', error);
    const message = error instanceof Error ? error.message : '';
    // Only expose expected business logic messages, not internal errors
    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (message.includes('Only canceled')) {
      return NextResponse.json({ error: 'Only canceled orders can be deleted' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
