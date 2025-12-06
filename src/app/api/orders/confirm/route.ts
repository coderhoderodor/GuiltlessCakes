import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { formatDate } from '@/lib/utils';
import { OrderService } from '@/lib/services/order.service';
import { OrderRepository } from '@/lib/repositories/supabase/order.repository';
import type { OrderItemWithTranslations } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const metadata = session.metadata || {};

    // Initialize service
    const orderRepository = new OrderRepository(supabase);
    const orderService = new OrderService(orderRepository);

    // Helper to get menu item price
    const getMenuItemPrice = async (menuItemId: string): Promise<number> => {
      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('base_price')
        .eq('id', menuItemId)
        .single();
      return menuItem?.base_price || 0;
    };

    // Create order using shared service (handles idempotency)
    const order = await orderService.createOrderFromStripeSession(
      session,
      getMenuItemPrice
    );

    // Update inventory for new orders (service handles idempotency, but we only update inventory once)
    const existingBefore = await orderService.getOrderByStripeSession(sessionId);
    if (!existingBefore || existingBefore.id === order.id) {
      const items = JSON.parse(metadata.items || '[]');
      for (const item of items) {
        // Use delivery_date instead of pickup_date
        await supabase.rpc('reserve_inventory', {
          p_menu_item_id: item.menu_item_id,
          p_pickup_date: metadata.delivery_date || metadata.pickup_date, // Support both for transition
          p_quantity: item.quantity,
        });
      }
    }

    // Get order items for response
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        quantity,
        unit_price,
        line_total,
        menu_item:menu_items (
          translations:menu_item_translations (name, language)
        )
      `)
      .eq('order_id', order.id);

    const typedOrderItems = orderItems as unknown as OrderItemWithTranslations[] | null;

    // Build delivery address from metadata
    const deliveryAddress = metadata.delivery_address_line1 ? {
      line1: metadata.delivery_address_line1,
      line2: metadata.delivery_address_line2 || undefined,
      city: metadata.delivery_city,
      state: metadata.delivery_state,
      zip: metadata.delivery_zip,
    } : null;

    return NextResponse.json({
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      deliveryDate: formatDate(metadata.delivery_date || metadata.pickup_date),
      deliveryWindow: metadata.delivery_window || metadata.pickup_window,
      deliveryAddress,
      total: order.total_amount,
      items: typedOrderItems?.map((item) => ({
        name: item.menu_item?.translations?.find((t) => t.language === 'en')?.name || 'Item',
        quantity: item.quantity,
        price: item.line_total,
      })) || [],
    });
  } catch (error) {
    console.error('Order confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm order' },
      { status: 500 }
    );
  }
}
