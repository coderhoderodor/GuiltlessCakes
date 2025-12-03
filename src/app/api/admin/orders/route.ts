/**
 * Admin Orders API - CRUD Operations
 *
 * GET    /api/admin/orders     - List all orders (with optional date filter)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOrderService } from '@/lib/services';
import { verifyAdmin, isAdminAuthError } from '@/lib/auth';
import { orderStatusSchema } from '@/lib/validation';
import type { OrderStatus } from '@/types';

// Valid order statuses for filtering
const VALID_ORDER_STATUSES = ['paid', 'prepping', 'ready', 'picked_up', 'canceled'] as const;

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (isAdminAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    const orderService = createOrderService(auth.supabase);

    // Validate status parameter if provided
    let validatedStatus: OrderStatus | undefined;
    if (status) {
      const result = orderStatusSchema.safeParse(status);
      if (!result.success) {
        return NextResponse.json(
          { error: 'Invalid status parameter', validStatuses: VALID_ORDER_STATUSES },
          { status: 400 }
        );
      }
      validatedStatus = result.data;
    }

    let orders;
    if (date && validatedStatus) {
      orders = await orderService.getOrdersByDateAndStatus(date, validatedStatus);
    } else if (date) {
      orders = await orderService.getOrdersByDate(date);
    } else if (validatedStatus) {
      orders = await orderService.getOrdersByStatus(validatedStatus);
    } else {
      orders = await orderService.getAllOrders();
    }

    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
