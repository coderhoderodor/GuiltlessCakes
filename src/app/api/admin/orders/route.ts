/**
 * Admin Orders API - CRUD Operations
 *
 * GET    /api/admin/orders     - List all orders (with optional date filter)
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin, isAuthError } from '@/lib/auth';
import { createOrderService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (isAuthError(auth)) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    const orderService = createOrderService(auth.supabase);

    let orders;
    if (date && status) {
      orders = await orderService.getOrdersByDateAndStatus(
        date,
        status as 'paid' | 'prepping' | 'ready' | 'picked_up' | 'canceled'
      );
    } else if (date) {
      orders = await orderService.getOrdersByDate(date);
    } else if (status) {
      orders = await orderService.getOrdersByStatus(
        status as 'paid' | 'prepping' | 'ready' | 'picked_up' | 'canceled'
      );
    } else {
      orders = await orderService.getAllOrders();
    }

    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
