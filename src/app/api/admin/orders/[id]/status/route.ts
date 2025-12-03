/**
 * Admin Order Status API
 *
 * PUT /api/admin/orders/[id]/status - Update order status
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createOrderService } from '@/lib/services';
import { orderStatusSchema } from '@/lib/validation';
import type { OrderStatus } from '@/types';

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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await verifyAdmin();
    if ('error' in auth) {
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
    const message = error instanceof Error ? error.message : 'Failed to update order status';
    const status = message.includes('not found') ? 404 : message.includes('Cannot transition') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
