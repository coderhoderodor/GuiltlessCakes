'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Truck,
  MapPin,
  ShoppingBag,
  ArrowLeft,
  CreditCard,
  AlertCircle,
  Clock,
  Check,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { Button, Card, CardContent, Select, Input } from '@/components/ui';
import { formatCurrency, getNextFriday, getOrderingCutoff, isOrderingClosed, formatDate } from '@/lib/utils';
import { DELIVERY_WINDOWS, DEFAULT_SERVICE_FEE_RATE, FREE_DELIVERY_MINIMUM, DELIVERY_FEE, DELIVERY_DAYS } from '@/lib/constants';
import { isZipInServiceArea, getZipValidationError } from '@/lib/delivery/service-area';

// Get next available delivery date (Friday or Saturday)
function getNextDeliveryDate(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // If it's after Wednesday 11:59 PM, we need to look at next week
  const cutoff = getOrderingCutoff(getNextFriday());
  const isAfterCutoff = now > cutoff;

  let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
  if (daysUntilFriday === 0 && isAfterCutoff) daysUntilFriday = 7;
  if (daysUntilFriday === 0 && dayOfWeek === 5) daysUntilFriday = 0; // It's Friday before cutoff

  const nextFriday = new Date(now);
  nextFriday.setDate(now.getDate() + (isAfterCutoff ? daysUntilFriday + 7 : daysUntilFriday));
  nextFriday.setHours(0, 0, 0, 0);

  return nextFriday;
}

// Get available delivery dates (Friday and Saturday of the delivery week)
function getDeliveryDates(): Date[] {
  const friday = getNextDeliveryDate();
  const saturday = new Date(friday);
  saturday.setDate(friday.getDate() + 1);
  return [friday, saturday];
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, deliveryFee, total, clearCart, setDeliveryWindow, setDeliveryDate, setDeliveryAddress } = useCart();
  const { isAuthenticated, user, profile, loading } = useAuth();

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedWindow, setSelectedWindow] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('PA');
  const [zip, setZip] = useState('');
  const [zipError, setZipError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [useSavedAddress, setUseSavedAddress] = useState(false);

  const deliveryDates = getDeliveryDates();
  const cutoffDate = getOrderingCutoff(deliveryDates[0]);
  const orderingClosed = isOrderingClosed(cutoffDate);

  const serviceFee = subtotal * DEFAULT_SERVICE_FEE_RATE;
  const estimatedTax = (subtotal + serviceFee) * 0.08;
  const grandTotal = subtotal + serviceFee + estimatedTax + deliveryFee;

  const [redirecting, setRedirecting] = useState(false);

  // Pre-fill saved address if available
  useEffect(() => {
    if (profile?.delivery_address_line1 && !addressLine1) {
      setAddressLine1(profile.delivery_address_line1 || '');
      setAddressLine2(profile.delivery_address_line2 || '');
      setCity(profile.delivery_city || '');
      setState(profile.delivery_state || 'PA');
      setZip(profile.delivery_zip || '');
      setUseSavedAddress(true);
    }
  }, [profile]);

  // Handle redirects
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      setRedirecting(true);
      router.replace('/auth/login?redirectTo=/checkout');
      return;
    }

    if (cart.items.length === 0) {
      setRedirecting(true);
      router.replace('/menu');
      return;
    }
  }, [loading, isAuthenticated, cart.items.length, router]);

  // Validate ZIP code on change
  const handleZipChange = (value: string) => {
    setZip(value);
    if (value.length >= 5) {
      const error = getZipValidationError(value);
      setZipError(error || '');
    } else {
      setZipError('');
    }
  };

  const handleCheckout = async () => {
    // Validation
    if (!selectedDate) {
      setError('Please select a delivery date');
      return;
    }
    if (!selectedWindow) {
      setError('Please select a delivery window');
      return;
    }
    if (!addressLine1 || !city || !zip) {
      setError('Please complete your delivery address');
      return;
    }

    const zipValidationError = getZipValidationError(zip);
    if (zipValidationError) {
      setZipError(zipValidationError);
      setError('Please enter a valid delivery address within our service area');
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
          deliveryDate: selectedDate,
          deliveryWindowId: selectedWindow,
          deliveryAddress: {
            line1: addressLine1,
            line2: addressLine2,
            city,
            state,
            zip,
          },
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
        <p className="text-neutral-500 text-sm">Loading...</p>
      </div>
    );
  }

  // Show redirecting state
  if (!isAuthenticated || cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 py-12 px-4">
        {redirecting ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
            <p className="text-neutral-500 text-sm">Redirecting...</p>
          </>
        ) : (
          <Card variant="elevated" className="w-full max-w-md text-center">
            <CardContent>
              <ShoppingBag className="w-16 h-16 text-pink-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-neutral-800 mb-2">
                {!isAuthenticated ? 'Sign in required' : 'Your cart is empty'}
              </h2>
              <p className="text-neutral-600 mb-6">
                {!isAuthenticated
                  ? 'Please sign in to continue with checkout.'
                  : 'Add some items to your cart before checking out.'}
              </p>
              <Link href={!isAuthenticated ? '/auth/login?redirectTo=/checkout' : '/menu'}>
                <Button>{!isAuthenticated ? 'Sign In' : 'Browse Menu'}</Button>
              </Link>
            </CardContent>
          </Card>
        )}
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
            {/* Delivery Information */}
            <Card variant="outlined">
              <CardContent>
                <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center gap-3">
                  <Truck className="w-5 h-5 text-pink-600" />
                  Delivery Information
                </h2>

                <div className="space-y-6">
                  {/* Delivery Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      Select Delivery Date
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {deliveryDates.map((date) => {
                        const dateStr = date.toISOString().split('T')[0];
                        const isSelected = selectedDate === dateStr;
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setDeliveryDate(dateStr);
                            }}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-pink-500 bg-pink-50'
                                : 'border-neutral-200 hover:border-pink-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-neutral-800">{dayName}</p>
                                <p className="text-sm text-neutral-500">{formatDate(date)}</p>
                              </div>
                              {isSelected && <Check className="w-5 h-5 text-pink-600" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery Window Selection */}
                  <Select
                    label="Select Delivery Window"
                    value={selectedWindow}
                    onChange={(e) => {
                      setSelectedWindow(e.target.value);
                      setDeliveryWindow(e.target.value);
                    }}
                    options={DELIVERY_WINDOWS.map((window) => ({
                      value: window.label,
                      label: window.label,
                    }))}
                    placeholder="Choose a 2-hour window"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card variant="outlined">
              <CardContent>
                <h2 className="text-xl font-semibold text-neutral-800 mb-6 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-pink-600" />
                  Delivery Address
                </h2>

                <div className="space-y-4">
                  <Input
                    label="Street Address"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="123 Main Street"
                    required
                  />

                  <Input
                    label="Apt, Suite, Unit (optional)"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Apt 4B"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Philadelphia"
                      required
                    />
                    <Input
                      label="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="PA"
                      required
                    />
                  </div>

                  <Input
                    label="ZIP Code"
                    value={zip}
                    onChange={(e) => handleZipChange(e.target.value)}
                    placeholder="19136"
                    required
                    error={zipError}
                    helperText={!zipError ? "We deliver within 20 miles of Northeast Philadelphia" : undefined}
                  />

                  {zipError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p>{zipError}</p>
                    </div>
                  )}
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
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      {subtotal >= FREE_DELIVERY_MINIMUM ? (
                        <span className="text-green-600 font-medium">Free</span>
                      ) : (
                        <span>{formatCurrency(deliveryFee)}</span>
                      )}
                    </div>
                    {subtotal < FREE_DELIVERY_MINIMUM && (
                      <p className="text-xs text-pink-600">
                        Add {formatCurrency(FREE_DELIVERY_MINIMUM - subtotal)} more for free delivery!
                      </p>
                    )}
                    <hr className="border-neutral-200" />
                    <div className="flex justify-between text-lg font-semibold text-neutral-800">
                      <span>Total</span>
                      <span>{formatCurrency(grandTotal)}</span>
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
                    disabled={!selectedDate || !selectedWindow || !addressLine1 || !city || !zip || !!zipError}
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
