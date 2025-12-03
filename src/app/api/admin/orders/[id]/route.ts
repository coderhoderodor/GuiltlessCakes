/**
 * Admin Order API - Individual CRUD Operations
 *
 * GET    /api/admin/orders/[id]           - Get a specific order
 * PUT    /api/admin/orders/[id]           - Update an order
 * DELETE /api/admin/orders/[id]           - Delete an order (only canceled)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOrderService } from '@/lib/services';
import { validate, updateOrderSchema } from '@/lib/validation';

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: 'Forbidden', status: 403 };
  }

  return { user, supabase };
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if ('error' in auth) {
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
      { error: error instanceof Error ? error.message : 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if ('error' in auth) {
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
    const message = error instanceof Error ? error.message : 'Failed to update order';
    const status = message.includes('not found') ? 404 : message.includes('Cannot transition') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const orderService = createOrderService(auth.supabase);
    await orderService.deleteOrder(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete order:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete order';
    const status = message.includes('not found') ? 404 : message.includes('Only canceled') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
