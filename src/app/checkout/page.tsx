'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  MapPin,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, CardContent, Select } from '@/components/ui';
import { formatCurrency, getNextFriday, getOrderingCutoff, isOrderingClosed, formatDate } from '@/lib/utils';
import { PICKUP_WINDOWS, DEFAULT_SERVICE_FEE_RATE } from '@/lib/constants';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart, setPickupWindow } = useCart();
  const { isAuthenticated, user, profile, loading } = useAuth();
  const [selectedWindow, setSelectedWindow] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const nextFriday = getNextFriday();
  const cutoffDate = getOrderingCutoff(nextFriday);
  const orderingClosed = isOrderingClosed(cutoffDate);

  const serviceFee = subtotal * DEFAULT_SERVICE_FEE_RATE;
  const estimatedTax = (subtotal + serviceFee) * 0.08; // Estimate 8% tax
  const total = subtotal + serviceFee + estimatedTax;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login?redirectTo=/checkout');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (cart.items.length === 0 && !loading) {
      router.push('/menu');
    }
  }, [cart.items.length, loading, router]);

  const handleCheckout = async () => {
    if (!selectedWindow) {
      setError('Please select a pickup window');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.items,
          pickupDate: nextFriday.toISOString().split('T')[0],
          pickupWindowId: selectedWindow,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to proceed to checkout');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
      </div>
    );
  }

  if (orderingClosed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <Card variant="elevated" className="w-full max-w-md text-center">
          <CardContent>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-neutral-800 mb-2">
              Ordering Closed
            </h2>
            <p className="text-neutral-600 mb-6">
              Sorry, ordering for this week has closed. Please check back for
              next week&apos;s menu.
            </p>
            <Link href="/menu">
              <Button>Back to Menu</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-20">
      <div className="container">
        <div className="mb-10">
          <Link
            href="/menu"
            className="inline-flex items-center text-neutral-600 hover:text-pink-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-neutral-800 mb-10">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pickup Information */}
            <Card variant="outlined">
              <CardContent>
                <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-pink-600" />
                  Pickup Information
                </h2>

                <div className="space-y-6">
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <p className="font-medium text-neutral-800">
                      {formatDate(nextFriday)}
                    </p>
                    <p className="text-sm text-neutral-600">
                      Northeast Philadelphia, PA
                    </p>
                  </div>

                  <Select
                    label="Select Pickup Window"
                    value={selectedWindow}
                    onChange={(e) => {
                      setSelectedWindow(e.target.value);
                      setPickupWindow(e.target.value);
                    }}
                    options={PICKUP_WINDOWS.map((window) => ({
                      value: window.label,
                      label: window.label,
                    }))}
                    placeholder="Choose a 2-hour window"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card variant="outlined">
              <CardContent>
                <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-pink-600" />
                  Order Items ({cart.items.length})
                </h2>

                <ul className="divide-y divide-neutral-100">
                  {cart.items.map((item) => (
                    <li key={item.menuItemId} className="py-5 flex gap-5">
                      <div className="w-16 h-16 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-pink-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-800">
                          {item.name}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          Qty: {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-neutral-800">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card variant="outlined">
              <CardContent>
                <h2 className="text-xl font-semibold text-neutral-800 mb-6">
                  Customer Information
                </h2>

                <div className="space-y-3 text-neutral-600">
                  <p>
                    <strong>Name:</strong> {profile?.first_name}{' '}
                    {profile?.last_name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user?.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {profile?.phone || 'Not provided'}
                  </p>
                </div>

                <Link
                  href="/account/settings"
                  className="text-sm text-pink-600 hover:underline mt-4 inline-block"
                >
                  Update account details
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card variant="elevated">
                <CardContent>
                  <h2 className="text-xl font-semibold text-neutral-800 mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 text-neutral-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Fee ({(DEFAULT_SERVICE_FEE_RATE * 100).toFixed(0)}%)</span>
                      <span>{formatCurrency(serviceFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Tax</span>
                      <span>{formatCurrency(estimatedTax)}</span>
                    </div>
                    <hr className="border-neutral-200" />
                    <div className="flex justify-between text-lg font-semibold text-neutral-800">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500 mt-4">
                    Final tax amount calculated at payment
                  </p>

                  {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    fullWidth
                    size="lg"
                    className="mt-6"
                    onClick={handleCheckout}
                    isLoading={isSubmitting}
                    disabled={!selectedWindow}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceed to Payment
                  </Button>

                  <p className="text-xs text-neutral-500 mt-4 text-center">
                    Secure checkout powered by Stripe
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
