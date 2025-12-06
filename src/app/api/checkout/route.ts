import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { DEFAULT_SERVICE_FEE_RATE, FREE_DELIVERY_MINIMUM, DELIVERY_FEE } from '@/lib/constants';
import { rateLimit, createRateLimitKey, getClientIp, RATE_LIMITS } from '@/lib/rate-limit';
import { env } from '@/lib/env';
import { isZipInServiceArea } from '@/lib/delivery/service-area';

interface DeliveryAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limit check - 10 requests per minute per user
    const ip = getClientIp(request.headers);
    const rateLimitKey = createRateLimitKey(user.id, ip, 'checkout');
    const rateLimitResult = rateLimit(rateLimitKey, RATE_LIMITS.checkout);

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfter) },
        }
      );
    }

    const body = await request.json();
    const { items, deliveryDate, deliveryWindowId, deliveryAddress } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    if (!deliveryDate || !deliveryWindowId) {
      return NextResponse.json(
        { error: 'Delivery date and window required' },
        { status: 400 }
      );
    }

    if (!deliveryAddress || !deliveryAddress.line1 || !deliveryAddress.city || !deliveryAddress.zip) {
      return NextResponse.json(
        { error: 'Complete delivery address required' },
        { status: 400 }
      );
    }

    // Validate ZIP code is in service area
    if (!isZipInServiceArea(deliveryAddress.zip)) {
      return NextResponse.json(
        { error: 'Sorry, we do not deliver to this ZIP code. Please check our service area.' },
        { status: 400 }
      );
    }

    // Get menu items from database to verify prices
    const menuItemIds = items.map((item: { menuItemId: string }) => item.menuItemId);
    console.log('[Checkout] Verifying menu items:', menuItemIds);

    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, base_price, translations:menu_item_translations(name, language)')
      .in('id', menuItemIds);

    console.log('[Checkout] Menu items result:', { menuItems, menuError: menuError?.message });

    if (menuError || !menuItems || menuItems.length === 0) {
      console.error('[Checkout] Failed to verify menu items:', menuError?.message || 'No items found');
      return NextResponse.json(
        { error: 'Failed to verify menu items. Please refresh and try again.' },
        { status: 500 }
      );
    }

    // Build line items for Stripe
    const lineItems = items.map((item: { menuItemId: string; quantity: number; name: string }) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      if (!menuItem) {
        throw new Error(`Menu item not found: ${item.menuItemId}`);
      }

      const translation = menuItem.translations?.find((t: { language: string }) => t.language === 'en');
      const name = translation?.name || item.name;

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name,
          },
          unit_amount: Math.round(menuItem.base_price * 100),
        },
        quantity: item.quantity,
      };
    });

    // Calculate subtotal
    const subtotal = items.reduce((sum: number, item: { menuItemId: string; quantity: number }) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      return sum + (menuItem?.base_price || 0) * item.quantity;
    }, 0);

    // Add service fee as line item
    const serviceFee = subtotal * DEFAULT_SERVICE_FEE_RATE;
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Service Fee',
        },
        unit_amount: Math.round(serviceFee * 100),
      },
      quantity: 1,
    });

    // Calculate and add delivery fee if applicable
    const deliveryFee = subtotal >= FREE_DELIVERY_MINIMUM ? 0 : DELIVERY_FEE;
    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Delivery Fee',
          },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    // Get user profile for customer email
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, phone')
      .eq('id', user.id)
      .single();

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        delivery_date: deliveryDate,
        delivery_window: deliveryWindowId,
        delivery_address_line1: deliveryAddress.line1,
        delivery_address_line2: deliveryAddress.line2 || '',
        delivery_city: deliveryAddress.city,
        delivery_state: deliveryAddress.state,
        delivery_zip: deliveryAddress.zip,
        delivery_fee: String(deliveryFee),
        items: JSON.stringify(items.map((item: { menuItemId: string; quantity: number }) => ({
          menu_item_id: item.menuItemId,
          quantity: item.quantity,
        }))),
      },
      success_url: `${env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/checkout`,
      // automatic_tax: {
      //   enabled: true,
      // },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}
