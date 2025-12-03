'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Package, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Button, Card, CardContent, LoadingScreen } from '@/components/ui';
import { useCart } from '@/contexts/CartContext';

interface OrderDetails {
  orderNumber: string;
  pickupDate: string;
  pickupWindow: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Clear the cart on success
    clearCart();

    // Fetch order details from session
    const fetchOrderDetails = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/orders/confirm?session_id=${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch order details');
        }

        setOrderDetails(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError(err instanceof Error ? err.message : 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId, clearCart]);

  if (loading) {
    return <LoadingScreen message="Confirming your order..." />;
  }

  return (
    <div className="min-h-[60vh] py-12 px-4">
      <div className="container max-w-2xl mx-auto">
        <Card variant="elevated" className="text-center">
          <CardContent>
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold text-neutral-800 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-neutral-600 mb-8">
              Thank you for your order. We&apos;ve sent a confirmation email with
              all the details.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                {error}. Your order was still placed successfully.
              </div>
            )}

            {/* Order Details */}
            {orderDetails && (
              <div className="bg-neutral-50 rounded-xl p-6 mb-8 text-left">
                <h2 className="font-semibold text-neutral-800 mb-4">
                  Order #{orderDetails.orderNumber}
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-pink-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-neutral-800">Pickup Date</p>
                      <p className="text-neutral-600">{orderDetails.pickupDate}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-pink-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-neutral-800">Pickup Window</p>
                      <p className="text-neutral-600">{orderDetails.pickupWindow}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-pink-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-neutral-800">Location</p>
                      <p className="text-neutral-600">Northeast Philadelphia, PA</p>
                      <p className="text-sm text-neutral-500">
                        Exact address in confirmation email
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="bg-pink-50 rounded-xl p-6 mb-8 text-left">
              <h3 className="font-semibold text-neutral-800 mb-3">
                What&apos;s Next?
              </h3>
              <ul className="space-y-2 text-neutral-600 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-pink-600" />
                  Check your email for order confirmation
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-pink-600" />
                  Receive a reminder on Thursday
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-pink-600" />
                  Pick up your treats during your window
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/account/orders">
                <Button>
                  View My Orders
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/menu">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
