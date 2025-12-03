/**
 * Admin Orders API - CRUD Operations
 *
 * GET    /api/admin/orders     - List all orders (with optional date filter)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOrderService } from '@/lib/services';

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

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if ('error' in auth) {
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
