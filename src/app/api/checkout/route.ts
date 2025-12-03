import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { DEFAULT_SERVICE_FEE_RATE } from '@/lib/constants';

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

    const body = await request.json();
    const { items, pickupDate, pickupWindowId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    if (!pickupDate || !pickupWindowId) {
      return NextResponse.json(
        { error: 'Pickup date and window required' },
        { status: 400 }
      );
    }

    // Get menu items from database to verify prices
    const menuItemIds = items.map((item: { menuItemId: string }) => item.menuItemId);
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, base_price, translations:menu_item_translations(name, language)')
      .in('id', menuItemIds);

    if (menuError || !menuItems) {
      return NextResponse.json(
        { error: 'Failed to verify menu items' },
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
        pickup_date: pickupDate,
        pickup_window: pickupWindowId,
        items: JSON.stringify(items.map((item: { menuItemId: string; quantity: number }) => ({
          menu_item_id: item.menuItemId,
          quantity: item.quantity,
        }))),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      automatic_tax: {
        enabled: true,
      },
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
