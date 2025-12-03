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
import { createErrorResponse, NotFoundError, ValidationError } from '@/lib/errors';

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
      throw new NotFoundError('Order', id);
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return createErrorResponse(error);
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
      throw new ValidationError('Invalid order data', validation.errors);
    }

    const orderService = createOrderService(auth.supabase);
    const order = await orderService.updateOrder(id, validation.data!);

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Failed to update order:', error);
    return createErrorResponse(error);
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
    return createErrorResponse(error);
  }
}
