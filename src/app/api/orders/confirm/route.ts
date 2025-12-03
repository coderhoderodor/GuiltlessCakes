import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { formatDate } from '@/lib/utils';

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
      // Create the order
      const items = JSON.parse(metadata.items || '[]');
      const subtotal = (session.amount_subtotal || 0) / 100;
      const total = (session.amount_total || 0) / 100;
      const tax = (session.total_details?.amount_tax || 0) / 100;

      // Get pickup window ID
      const { data: pickupWindow } = await supabase
        .from('pickup_windows')
        .select('id')
        .eq('label', metadata.pickup_window)
        .single();

      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: metadata.user_id,
          pickup_date: metadata.pickup_date,
          pickup_window_id: pickupWindow?.id,
          status: 'paid',
          subtotal_amount: subtotal - (subtotal * 0.05), // Remove service fee from subtotal
          service_fee_amount: subtotal * 0.05,
          tax_amount: tax,
          total_amount: total,
          stripe_session_id: sessionId,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      order = newOrder;

      // Create order items
      for (const item of items) {
        const { data: menuItem } = await supabase
          .from('menu_items')
          .select('base_price')
          .eq('id', item.menu_item_id)
          .single();

        await supabase.from('order_items').insert({
          order_id: order.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: menuItem?.base_price || 0,
          line_total: (menuItem?.base_price || 0) * item.quantity,
        });

        // Update inventory
        await supabase.rpc('reserve_inventory', {
          p_menu_item_id: item.menu_item_id,
          p_pickup_date: metadata.pickup_date,
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

    return NextResponse.json({
      orderNumber: order.id.slice(0, 8).toUpperCase(),
      pickupDate: formatDate(metadata.pickup_date),
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
