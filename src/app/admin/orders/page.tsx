import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { formatCurrency, formatDate, getNextFriday } from '@/lib/utils';
import { ORDER_STATUSES } from '@/lib/constants';

async function getOrders(pickupDate?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('orders')
    .select(`
      *,
      pickup_window:pickup_windows (*),
      profile:profiles (first_name, last_name, phone, email:id),
      order_items (
        quantity,
        menu_item:menu_items (
          translations:menu_item_translations (name, language)
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (pickupDate) {
    query = query.eq('pickup_date', pickupDate);
  }

  const { data } = await query;
  return data || [];
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/');
  }

  const nextFriday = getNextFriday();
  const selectedDate = date || nextFriday.toISOString().split('T')[0];
  const orders = await getOrders(selectedDate);

  // Group orders by pickup window
  const ordersByWindow: Record<string, typeof orders> = {};
  orders.forEach((order) => {
    const windowLabel = order.pickup_window?.label || 'Unassigned';
    if (!ordersByWindow[windowLabel]) {
      ordersByWindow[windowLabel] = [];
    }
    ordersByWindow[windowLabel].push(order);
  });

  return (
    <div className="py-8">
      <div className="container">
        <Link
          href="/admin"
          className="inline-flex items-center text-neutral-600 hover:text-pink-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-neutral-800">Orders</h1>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-neutral-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  window.location.href = `/admin/orders?date=${e.target.value}`;
                }}
                className="px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          {ORDER_STATUSES.slice(0, 4).map((status) => {
            const count = orders.filter((o) => o.status === status.value).length;
            return (
              <Card key={status.value} variant="outlined">
                <CardContent className="text-center">
                  <p className="text-2xl font-bold text-neutral-800">{count}</p>
                  <p className="text-sm text-neutral-500">{status.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Orders by Window */}
        {Object.keys(ordersByWindow).length > 0 ? (
          <div className="space-y-8">
            {Object.entries(ordersByWindow).map(([windowLabel, windowOrders]) => (
              <div key={windowLabel}>
                <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                  {windowLabel}
                  <Badge variant="default">{windowOrders.length} orders</Badge>
                </h2>

                <div className="space-y-4">
                  {windowOrders.map((order) => {
                    const status = ORDER_STATUSES.find(
                      (s) => s.value === order.status
                    );

                    return (
                      <Card key={order.id} variant="outlined">
                        <CardContent>
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-neutral-800">
                                  #{order.id.slice(0, 8).toUpperCase()}
                                </h3>
                                <Badge className={status?.color}>
                                  {status?.label}
                                </Badge>
                              </div>

                              <p className="text-neutral-600">
                                {order.profile?.first_name}{' '}
                                {order.profile?.last_name}
                              </p>
                              <p className="text-sm text-neutral-500">
                                {order.profile?.phone}
                              </p>

                              <div className="mt-2 text-sm text-neutral-600">
                                {order.order_items?.map((item: {
                                  quantity: number;
                                  menu_item: {
                                    translations: Array<{ name: string; language: string }>;
                                  };
                                }, i: number) => {
                                  const name = item.menu_item?.translations?.find(
                                    (t) => t.language === 'en'
                                  )?.name;
                                  return (
                                    <span key={i}>
                                      {item.quantity}x {name}
                                      {i < order.order_items.length - 1 ? ', ' : ''}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-semibold text-neutral-800">
                                  {formatCurrency(order.total_amount)}
                                </p>
                                <p className="text-xs text-neutral-500">
                                  {formatDate(order.created_at).split(',')[0]}
                                </p>
                              </div>

                              <Link href={`/admin/orders/${order.id}`}>
                                <Button variant="outline" size="sm">
                                  Manage
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card variant="outlined">
            <CardContent className="text-center py-12">
              <p className="text-neutral-500">
                No orders for {formatDate(selectedDate)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
