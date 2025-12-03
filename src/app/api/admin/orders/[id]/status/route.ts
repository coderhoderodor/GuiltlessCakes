/**
 * Admin Order Status API
 *
 * PUT /api/admin/orders/[id]/status - Update order status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOrderService } from '@/lib/services';
import { orderStatusSchema } from '@/lib/validation';
import { verifyAdmin, isAdminAuthError } from '@/lib/auth';
import type { OrderStatus } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if (isAdminAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();

    // Validate status
    const result = orderStatusSchema.safeParse(body.status);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid status', details: result.error.errors },
        { status: 400 }
      );
    }

    const orderService = createOrderService(auth.supabase);
    const order = await orderService.updateStatus(id, result.data as OrderStatus);

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Failed to update order status:', error);
    const message = error instanceof Error ? error.message : '';
    // Only expose expected business logic messages, not internal errors
    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (message.includes('Cannot transition')) {
      return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
