import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { constructWebhookEvent } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_SERVICE_FEE_RATE } from '@/lib/constants';

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

async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};

  // Validate required metadata
  if (!metadata.user_id || !metadata.pickup_date || !metadata.pickup_window) {
    console.error('Missing required metadata:', metadata);
    throw new Error('Missing required order metadata');
  }

  // Check if order already exists (idempotency)
  const { data: existingOrder } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .single();

  if (existingOrder) {
    console.log('Order already exists:', existingOrder.id);
    return;
  }

  // Safely parse items JSON
  const items = safeJsonParse<OrderItemInput[]>(metadata.items, []);

  if (items.length === 0) {
    console.error('No items in order metadata');
    throw new Error('No items in order');
  }

  const subtotal = (session.amount_subtotal || 0) / 100;
  const total = (session.amount_total || 0) / 100;
  const tax = (session.total_details?.amount_tax || 0) / 100;

  // Get pickup window ID with proper error handling
  const { data: pickupWindow, error: pickupWindowError } = await supabaseAdmin
    .from('pickup_windows')
    .select('id')
    .eq('label', metadata.pickup_window)
    .single();

  if (pickupWindowError || !pickupWindow) {
    console.error('Pickup window not found:', metadata.pickup_window);
    throw new Error(`Pickup window not found: ${metadata.pickup_window}`);
  }

  // Create order using constant for service fee
  const serviceFee = subtotal * DEFAULT_SERVICE_FEE_RATE;
  const { data: order, error: orderError } = await supabaseAdmin
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
      stripe_session_id: session.id,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error('Failed to create order:', orderError);
    throw orderError || new Error('Failed to create order');
  }

  // Create order items and update inventory
  for (const item of items) {
    // Validate item has required fields
    if (!item.menu_item_id || !item.quantity) {
      console.warn('Skipping invalid item:', item);
      continue;
    }

    const { data: menuItem, error: menuItemError } = await supabaseAdmin
      .from('menu_items')
      .select('base_price')
      .eq('id', item.menu_item_id)
      .single();

    if (menuItemError || !menuItem) {
      console.warn('Menu item not found:', item.menu_item_id);
      continue;
    }

    const { error: orderItemError } = await supabaseAdmin.from('order_items').insert({
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
    const { error: inventoryError } = await supabaseAdmin.rpc('reserve_inventory', {
      p_menu_item_id: item.menu_item_id,
      p_pickup_date: metadata.pickup_date,
      p_quantity: item.quantity,
    });

    if (inventoryError) {
      console.error('Failed to reserve inventory:', inventoryError);
      // Note: We don't throw here as the order was created successfully
      // Inventory issues should be handled separately
    }
  }

  // TODO: Send confirmation email
  console.log('Order created successfully:', order.id);
}
