import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, Calendar, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ORDER_STATUSES, INQUIRY_STATUSES } from '@/lib/constants';

export const metadata = {
  title: 'My Orders',
};

async function getOrders(userId: string) {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      pickup_window:pickup_windows (*),
      order_items (
        *,
        menu_item:menu_items (
          translations:menu_item_translations (name, language)
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return orders || [];
}

async function getInquiries(userId: string) {
  const supabase = await createClient();

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return inquiries || [];
}

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login?redirectTo=/account/orders');
  }

  const [orders, inquiries] = await Promise.all([
    getOrders(user.id),
    getInquiries(user.id),
  ]);

  const upcomingOrders = orders.filter(
    (o) => o.status !== 'picked_up' && o.status !== 'canceled'
  );
  const pastOrders = orders.filter(
    (o) => o.status === 'picked_up' || o.status === 'canceled'
  );

  return (
    <div className="py-20 lg:py-32">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold text-neutral-800 mb-14">My Orders</h1>

        {/* Upcoming Orders */}
        <section className="mb-16">
          <h2 className="text-xl font-semibold text-neutral-800 mb-8 flex items-center gap-3">
            <Package className="w-5 h-5 text-pink-600" />
            Upcoming Orders
          </h2>

          {upcomingOrders.length > 0 ? (
            <div className="space-y-8">
              {upcomingOrders.map((order) => {
                const status = ORDER_STATUSES.find((s) => s.value === order.status);

                return (
                  <Card key={order.id} variant="outlined" hover>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-neutral-800">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </h3>
                            <Badge className={status?.color}>
                              {status?.label}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-5 text-sm text-neutral-600">
                            <span className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {formatDate(order.pickup_date)}
                            </span>
                            <span className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {order.pickup_window?.label}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-500 mt-3">
                            {order.order_items?.length} item(s) -{' '}
                            {formatCurrency(order.total_amount)}
                          </p>
                        </div>
                        <Link href={`/account/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card variant="outlined">
              <CardContent className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-5" />
                <p className="text-neutral-500 mb-6">No upcoming orders</p>
                <Link href="/menu">
                  <Button>Browse Menu</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Custom Cake Inquiries */}
        {inquiries.length > 0 && (
          <section className="mb-16">
            <h2 className="text-xl font-semibold text-neutral-800 mb-8">
              Custom Cake Inquiries
            </h2>

            <div className="space-y-8">
              {inquiries.map((inquiry) => {
                const status = INQUIRY_STATUSES.find(
                  (s) => s.value === inquiry.status
                );

                return (
                  <Card key={inquiry.id} variant="outlined">
                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-neutral-800 capitalize">
                              {inquiry.event_type.replace('_', ' ')} Cake
                            </h3>
                            <Badge className={status?.color}>
                              {status?.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-600 mb-2">
                            Event Date: {formatDate(inquiry.event_date)}
                          </p>
                          <p className="text-sm text-neutral-500">
                            {inquiry.servings} servings, {inquiry.tiers} tier(s),{' '}
                            {inquiry.shape}
                          </p>
                        </div>
                        <p className="text-sm text-neutral-500">
                          Submitted {formatDate(inquiry.created_at)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Past Orders */}
        {pastOrders.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-8">
              Past Orders
            </h2>

            <div className="space-y-8">
              {pastOrders.map((order) => {
                const status = ORDER_STATUSES.find((s) => s.value === order.status);

                return (
                  <Card key={order.id} variant="outlined">
                    <CardContent>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-medium text-neutral-700">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </h3>
                            <Badge className={status?.color}>
                              {status?.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-neutral-500">
                            {formatDate(order.pickup_date)} -{' '}
                            {formatCurrency(order.total_amount)}
                          </p>
                        </div>
                        <Link href={`/account/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
