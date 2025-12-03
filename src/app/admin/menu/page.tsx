import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Package, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { formatCurrency, getNextFriday, formatDate } from '@/lib/utils';

async function getMenuItems() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('menu_items')
    .select(`
      *,
      translations:menu_item_translations (*),
      schedules:menu_schedule (*)
    `)
    .order('created_at', { ascending: false });

  return data || [];
}

async function getScheduledItems(pickupDate: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('menu_schedule')
    .select(`
      *,
      menu_item:menu_items (
        *,
        translations:menu_item_translations (*)
      ),
      inventory:inventory (*)
    `)
    .eq('pickup_date', pickupDate);

  return data || [];
}

export default async function AdminMenuPage() {
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

  const menuItems = await getMenuItems();
  const nextFriday = getNextFriday();
  const scheduledItems = await getScheduledItems(
    nextFriday.toISOString().split('T')[0]
  );

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
          <h1 className="text-3xl font-bold text-neutral-800">Menu Management</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Button>
        </div>

        {/* This Week's Schedule */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-pink-600" />
            <h2 className="text-xl font-semibold text-neutral-800">
              This Week&apos;s Menu ({formatDate(nextFriday).split(',')[0]})
            </h2>
          </div>

          {scheduledItems.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scheduledItems.map((schedule) => {
                const item = schedule.menu_item;
                const translation = item?.translations?.find(
                  (t: { language: string }) => t.language === 'en'
                );
                const inventory = schedule.inventory?.[0];
                const available = inventory
                  ? inventory.daily_cap - inventory.reserved_quantity
                  : 0;

                return (
                  <Card key={schedule.id} variant="outlined">
                    <CardContent>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-neutral-800">
                            {translation?.name}
                          </h3>
                          <p className="text-pink-600 font-medium">
                            {formatCurrency(item?.base_price || 0)}
                          </p>
                        </div>
                        <Badge
                          variant={schedule.is_active ? 'success' : 'default'}
                        >
                          {schedule.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {inventory && (
                        <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span className="text-neutral-500">Available</span>
                            <span
                              className={
                                available <= 5
                                  ? 'text-orange-600 font-medium'
                                  : 'text-neutral-800'
                              }
                            >
                              {available} / {inventory.daily_cap}
                            </span>
                          </div>
                          <div className="mt-2 h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                available <= 5 ? 'bg-orange-500' : 'bg-pink-500'
                              }`}
                              style={{
                                width: `${
                                  (available / inventory.daily_cap) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm" fullWidth>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card variant="outlined">
              <CardContent className="text-center py-8">
                <p className="text-neutral-500 mb-4">
                  No items scheduled for this week
                </p>
                <Button variant="outline">Schedule Items</Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* All Menu Items */}
        <section>
          <h2 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-pink-600" />
            All Menu Items
          </h2>

          {menuItems.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {menuItems.map((item) => {
                const translation = item.translations?.find(
                  (t: { language: string }) => t.language === 'en'
                );

                return (
                  <Card key={item.id} variant="outlined" hover>
                    <CardContent>
                      <div className="aspect-square bg-pink-50 rounded-lg mb-3 flex items-center justify-center">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={translation?.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-12 h-12 text-pink-200" />
                        )}
                      </div>

                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-neutral-800">
                            {translation?.name}
                          </h3>
                          <p className="text-pink-600 font-medium">
                            {formatCurrency(item.base_price)}
                          </p>
                        </div>
                        <Badge variant={item.active ? 'success' : 'default'}>
                          {item.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      {item.dietary_tags?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {item.dietary_tags.map((tag: string) => (
                            <Badge key={tag} variant="default" size="sm">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Button variant="outline" size="sm" fullWidth className="mt-3">
                        Edit Item
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card variant="outlined">
              <CardContent className="text-center py-8">
                <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500 mb-4">No menu items yet</p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
