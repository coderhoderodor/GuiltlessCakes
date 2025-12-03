import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { formatDate } from '@/lib/utils';
import { DEFAULT_SERVICE_FEE_RATE } from '@/lib/constants';

/**
 * Safely parse JSON with error handling
 */
function safeJsonParse<T>(json: string | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return fallback;
  }
}

interface OrderItemInput {
  menu_item_id: string;
  quantity: number;
}

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

    // Check if order already exists
    let order;
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();

    if (existingOrder) {
      order = existingOrder;
    } else {
      // Validate required metadata
      if (!metadata.user_id || !metadata.pickup_date || !metadata.pickup_window) {
        return NextResponse.json(
          { error: 'Missing order metadata' },
          { status: 400 }
        );
      }

      // Safely parse items JSON
      const items = safeJsonParse<OrderItemInput[]>(metadata.items, []);

      if (items.length === 0) {
        return NextResponse.json(
          { error: 'No items in order' },
          { status: 400 }
        );
      }

      const subtotal = (session.amount_subtotal || 0) / 100;
      const total = (session.amount_total || 0) / 100;
      const tax = (session.total_details?.amount_tax || 0) / 100;

      // Get pickup window ID with proper error handling
      const { data: pickupWindow, error: pickupWindowError } = await supabase
        .from('pickup_windows')
        .select('id')
        .eq('label', metadata.pickup_window)
        .single();

      if (pickupWindowError || !pickupWindow) {
        console.error('Pickup window not found:', metadata.pickup_window);
        return NextResponse.json(
          { error: 'Invalid pickup window' },
          { status: 400 }
        );
      }

      // Use constant for service fee
      const serviceFee = subtotal * DEFAULT_SERVICE_FEE_RATE;

      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: metadata.user_id,
          pickup_date: metadata.pickup_date,
          pickup_window_id: pickupWindow.id,
          status: 'paid',
          subtotal_amount: subtotal - serviceFee,
          service_fee_amount: serviceFee,
          tax_amount: tax,
          total_amount: total,
          stripe_session_id: sessionId,
        })
        .select()
        .single();

      if (orderError || !newOrder) {
        console.error('Order creation error:', orderError);
        throw orderError || new Error('Failed to create order');
      }

      order = newOrder;

      // Create order items
      for (const item of items) {
        // Validate item has required fields
        if (!item.menu_item_id || !item.quantity) {
          console.warn('Skipping invalid item:', item);
          continue;
        }

        const { data: menuItem, error: menuItemError } = await supabase
          .from('menu_items')
          .select('base_price')
          .eq('id', item.menu_item_id)
          .single();

        if (menuItemError || !menuItem) {
          console.warn('Menu item not found:', item.menu_item_id);
          continue;
        }

        const { error: orderItemError } = await supabase.from('order_items').insert({
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: menuItem.base_price,
          line_total: menuItem.base_price * item.quantity,
        });

        if (orderItemError) {
          console.error('Failed to create order item:', orderItemError);
        }

        // Update inventory with error handling
        const { error: inventoryError } = await supabase.rpc('reserve_inventory', {
          p_menu_item_id: item.menu_item_id,
          p_pickup_date: metadata.pickup_date,
          p_quantity: item.quantity,
        });

        if (inventoryError) {
          console.error('Failed to reserve inventory:', inventoryError);
        }
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

    return NextResponse.json({
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      pickupDate: formatDate(metadata.pickup_date || order.pickup_date),
      pickupWindow: metadata.pickup_window,
      total: order.total_amount,
      items: orderItems?.map((item) => ({
        name: item.menu_item?.translations?.find((t: { language: string }) => t.language === 'en')?.name || 'Item',
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
