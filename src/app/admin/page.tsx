import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  MessageSquare,
  DollarSign,
  ArrowRight,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { formatCurrency, getNextFriday, formatDate } from '@/lib/utils';

async function getDashboardData() {
  const supabase = await createClient();
  const nextFriday = getNextFriday();
  const pickupDate = nextFriday.toISOString().split('T')[0];

  // Get upcoming orders count
  const { count: upcomingOrdersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('pickup_date', pickupDate)
    .in('status', ['paid', 'prepping', 'ready']);

  // Get new inquiries count
  const { count: newInquiriesCount } = await supabase
    .from('inquiries')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new');

  // Get revenue for this week
  const { data: weekRevenue } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('pickup_date', pickupDate)
    .in('status', ['paid', 'prepping', 'ready', 'picked_up']);

  const totalRevenue = weekRevenue?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

  // Get low inventory items
  const { data: lowInventory } = await supabase
    .from('inventory')
    .select(`
      *,
      menu_item:menu_items (
        translations:menu_item_translations (name, language)
      )
    `)
    .eq('pickup_date', pickupDate)
    .lt('daily_cap', 5);

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select(`
      *,
      pickup_window:pickup_windows (label),
      profile:profiles (first_name, last_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get orders by pickup window
  const { data: ordersByWindow } = await supabase
    .from('orders')
    .select('pickup_window_id, pickup_window:pickup_windows (label)')
    .eq('pickup_date', pickupDate)
    .in('status', ['paid', 'prepping', 'ready']);

  return {
    upcomingOrdersCount: upcomingOrdersCount || 0,
    newInquiriesCount: newInquiriesCount || 0,
    totalRevenue,
    lowInventory: lowInventory || [],
    recentOrders: recentOrders || [],
    ordersByWindow: ordersByWindow || [],
    pickupDate,
  };
}

export default async function AdminDashboard() {
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

  const data = await getDashboardData();
  const nextFriday = getNextFriday();

  return (
    <div className="py-8">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800">Admin Dashboard</h1>
            <p className="text-neutral-500">
              Manage orders, menu, and inquiries
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600 bg-pink-50 px-4 py-2 rounded-lg">
            <Calendar className="w-4 h-4 text-pink-600" />
            Next pickup: {formatDate(nextFriday)}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="outlined">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">Upcoming Orders</p>
                  <p className="text-3xl font-bold text-neutral-800">
                    {data.upcomingOrdersCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-pink-600" />
                </div>
              </div>
              <Link
                href="/admin/orders"
                className="text-sm text-pink-600 hover:underline mt-2 inline-block"
              >
                View all orders
              </Link>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">New Inquiries</p>
                  <p className="text-3xl font-bold text-neutral-800">
                    {data.newInquiriesCount}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <Link
                href="/admin/inquiries"
                className="text-sm text-pink-600 hover:underline mt-2 inline-block"
              >
                View inquiries
              </Link>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">This Week Revenue</p>
                  <p className="text-3xl font-bold text-neutral-800">
                    {formatCurrency(data.totalRevenue)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">Low Stock Items</p>
                  <p className="text-3xl font-bold text-neutral-800">
                    {data.lowInventory.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <Link
                href="/admin/menu"
                className="text-sm text-pink-600 hover:underline mt-2 inline-block"
              >
                Manage inventory
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card variant="outlined">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-800">
                  Recent Orders
                </h2>
                <Link href="/admin/orders">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {data.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {data.recentOrders.map((order: {
                    id: string;
                    status: string;
                    total_amount: number;
                    pickup_window: { label: string } | null;
                    profile: { first_name: string; last_name: string } | null;
                  }) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-neutral-800">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm text-neutral-500">
                          {order.profile?.first_name} {order.profile?.last_name} -{' '}
                          {order.pickup_window?.label}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-neutral-800">
                          {formatCurrency(order.total_amount)}
                        </p>
                        <Badge
                          variant={
                            order.status === 'paid'
                              ? 'success'
                              : order.status === 'ready'
                              ? 'info'
                              : 'default'
                          }
                          size="sm"
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-center py-8">
                  No recent orders
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card variant="outlined">
            <CardContent>
              <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <Link href="/admin/menu">
                  <Button variant="outline" fullWidth className="h-20 flex-col">
                    <Package className="w-6 h-6 mb-2" />
                    Manage Menu
                  </Button>
                </Link>
                <Link href="/admin/orders">
                  <Button variant="outline" fullWidth className="h-20 flex-col">
                    <ShoppingCart className="w-6 h-6 mb-2" />
                    View Orders
                  </Button>
                </Link>
                <Link href="/admin/inquiries">
                  <Button variant="outline" fullWidth className="h-20 flex-col">
                    <MessageSquare className="w-6 h-6 mb-2" />
                    Inquiries
                  </Button>
                </Link>
                <Link href="/admin/settings">
                  <Button variant="outline" fullWidth className="h-20 flex-col">
                    <DollarSign className="w-6 h-6 mb-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Inventory Alert */}
        {data.lowInventory.length > 0 && (
          <Card variant="outlined" className="mt-8">
            <CardContent>
              <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Low Inventory Alert
              </h2>

              <div className="space-y-2">
                {data.lowInventory.map((item: {
                  id: string;
                  daily_cap: number;
                  reserved_quantity: number;
                  menu_item: {
                    translations: Array<{ name: string; language: string }>;
                  };
                }) => {
                  const name = item.menu_item?.translations?.find(
                    (t) => t.language === 'en'
                  )?.name;
                  const available = item.daily_cap - item.reserved_quantity;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                    >
                      <span className="font-medium text-neutral-800">{name}</span>
                      <span className="text-yellow-700">
                        {available} remaining of {item.daily_cap}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
