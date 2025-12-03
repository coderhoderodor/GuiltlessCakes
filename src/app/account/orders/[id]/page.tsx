import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { formatCurrency, formatDate, canModifyOrder } from '@/lib/utils';
import { ORDER_STATUSES } from '@/lib/constants';

export const metadata = {
  title: 'Order Details',
};

async function getOrder(orderId: string, userId: string) {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from('orders')
    .select(`
      *,
      pickup_window:pickup_windows (*),
      order_items (
        *,
        menu_item:menu_items (
          image_url,
          translations:menu_item_translations (name, description, language)
        )
      )
    `)
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  return order;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/account/orders');
  }

  const order = await getOrder(id, user.id);

  if (!order) {
    notFound();
  }

  const status = ORDER_STATUSES.find((s) => s.value === order.status);
  const canModify = canModifyOrder(
    order.pickup_date,
    order.pickup_window?.start_time || '10:00'
  );

  return (
    <div className="py-8 lg:py-12">
      <div className="container max-w-3xl">
        <Link
          href="/account/orders"
          className="inline-flex items-center text-neutral-600 hover:text-pink-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h1>
            <p className="text-neutral-500">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <Badge className={status?.color} size="md">
            {status?.label}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Pickup Information */}
          <Card variant="outlined">
            <CardContent>
              <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-pink-600" />
                Pickup Information
              </h2>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500">Date</p>
                    <p className="font-medium text-neutral-800">
                      {formatDate(order.pickup_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500">Time</p>
                    <p className="font-medium text-neutral-800">
                      {order.pickup_window?.label}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-neutral-500">Location</p>
                    <p className="font-medium text-neutral-800">
                      Northeast Philadelphia
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card variant="outlined">
            <CardContent>
              <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                Order Items
              </h2>

              <ul className="divide-y divide-neutral-100">
                {order.order_items?.map((item: {
                  id: string;
                  quantity: number;
                  unit_price: number;
                  line_total: number;
                  menu_item: {
                    image_url: string | null;
                    translations: Array<{
                      name: string;
                      description: string;
                      language: string;
                    }>;
                  };
                }) => {
                  const translation = item.menu_item?.translations?.find(
                    (t) => t.language === 'en'
                  );

                  return (
                    <li key={item.id} className="py-4 flex gap-4">
                      <div className="w-16 h-16 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.menu_item?.image_url ? (
                          <img
                            src={item.menu_item.image_url}
                            alt={translation?.name || ''}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-6 h-6 text-pink-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-800">
                          {translation?.name}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          Qty: {item.quantity} x {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-neutral-800">
                          {formatCurrency(item.line_total)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card variant="outlined">
            <CardContent>
              <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                Order Summary
              </h2>

              <div className="space-y-2 text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>{formatCurrency(order.service_fee_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
                <hr className="border-neutral-200 my-2" />
                <div className="flex justify-between text-lg font-semibold text-neutral-800">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {canModify && order.status === 'paid' && (
            <Card variant="outlined">
              <CardContent>
                <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                  Need to Make Changes?
                </h2>
                <p className="text-neutral-600 mb-4">
                  You can modify or cancel this order up to 24 hours before your
                  pickup window.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline">Modify Order</Button>
                  <Button variant="danger">Cancel Order</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!canModify && order.status === 'paid' && (
            <div className="p-4 bg-yellow-50 rounded-lg text-yellow-700 text-sm">
              Order modifications are no longer available. For urgent changes,
              please contact us directly.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
