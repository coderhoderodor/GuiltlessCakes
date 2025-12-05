import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { constructWebhookEvent } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { OrderService } from '@/lib/services/order.service';
import { OrderRepository } from '@/lib/repositories/supabase/order.repository';

// Create admin client for webhook processing
const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize service with repository
const orderRepository = new OrderRepository(supabaseAdmin);
const orderService = new OrderService(orderRepository);

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
  // Helper to get menu item price from database
  const getMenuItemPrice = async (menuItemId: string): Promise<number> => {
    const { data: menuItem } = await supabaseAdmin
      .from('menu_items')
      .select('base_price')
      .eq('id', menuItemId)
      .single();
    return menuItem?.base_price || 0;
  };

  // Create order using the shared service (handles idempotency)
  const order = await orderService.createOrderFromStripeSession(
    session,
    getMenuItemPrice
  );

  // Update inventory for each item
  const metadata = session.metadata || {};
  const items = JSON.parse(metadata.items || '[]');

  for (const item of items) {
    await supabaseAdmin.rpc('reserve_inventory', {
      p_menu_item_id: item.menu_item_id,
      p_pickup_date: metadata.pickup_date,
      p_quantity: item.quantity,
    });
  }

  // TODO: Send confirmation email
  console.log('Order created successfully:', order.id);
}
