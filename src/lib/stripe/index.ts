import Stripe from 'stripe';
import { env } from '@/lib/env';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export async function createCheckoutSession({
  lineItems,
  customerId,
  customerEmail,
  metadata,
  successUrl,
  cancelUrl,
}: {
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  customerId?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    customer: customerId,
    customer_email: customerId ? undefined : customerEmail,
    metadata,
    success_url: successUrl,
    cancel_url: cancelUrl,
    automatic_tax: {
      enabled: true,
    },
  });

  return session;
}

export async function createPaymentLink({
  price,
  quantity = 1,
  metadata,
}: {
  price: number;
  quantity?: number;
  metadata?: Record<string, string>;
}) {
  // Create a price for one-time payment
  const priceObject = await stripe.prices.create({
    currency: 'usd',
    unit_amount: Math.round(price * 100),
    product_data: {
      name: 'Custom Cake Order',
    },
  });

  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: priceObject.id,
        quantity,
      },
    ],
    metadata,
  });

  return paymentLink;
}

export async function retrieveCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'customer'],
  });
  return session;
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );
}
