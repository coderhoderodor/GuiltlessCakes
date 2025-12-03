import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, constructWebhookEvent } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

// Create admin client for webhook processing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = await constructWebhookEvent(body, signature);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status === 'paid') {
          await handleSuccessfulPayment(session);
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session expired:', session.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};

  // Check if order already exists
  const { data: existingOrder } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .single();

  if (existingOrder) {
    console.log('Order already exists:', existingOrder.id);
    return;
  }

  const items = JSON.parse(metadata.items || '[]');
  const subtotal = (session.amount_subtotal || 0) / 100;
  const total = (session.amount_total || 0) / 100;
  const tax = (session.total_details?.amount_tax || 0) / 100;

  // Get pickup window ID
  const { data: pickupWindow } = await supabaseAdmin
    .from('pickup_windows')
    .select('id')
    .eq('label', metadata.pickup_window)
    .single();

  // Create order
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: metadata.user_id,
      pickup_date: metadata.pickup_date,
      pickup_window_id: pickupWindow?.id,
      status: 'paid',
      subtotal_amount: subtotal * 0.95,
      service_fee_amount: subtotal * 0.05,
      tax_amount: tax,
      total_amount: total,
      stripe_session_id: session.id,
    })
    .select()
    .single();

  if (orderError) {
    console.error('Failed to create order:', orderError);
    throw orderError;
  }

  // Create order items and update inventory
  for (const item of items) {
    const { data: menuItem } = await supabaseAdmin
      .from('menu_items')
      .select('base_price')
      .eq('id', item.menu_item_id)
      .single();

    await supabaseAdmin.from('order_items').insert({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      unit_price: menuItem?.base_price || 0,
      line_total: (menuItem?.base_price || 0) * item.quantity,
    });

    // Update inventory
    await supabaseAdmin.rpc('reserve_inventory', {
      p_menu_item_id: item.menu_item_id,
      p_pickup_date: metadata.pickup_date,
      p_quantity: item.quantity,
    });
  }

  // TODO: Send confirmation email
  console.log('Order created successfully:', order.id);
}
