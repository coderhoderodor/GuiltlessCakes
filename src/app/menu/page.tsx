import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { MenuGrid } from '@/components/menu/MenuGrid';
import { getNextFriday, getOrderingCutoff, isOrderingClosed, formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: "This Week's Menu",
  description:
    "Browse our weekly rotating menu of cupcakes, slices, and pre-made cakes. Order by Wednesday for Friday pickup.",
};

async function getMenuItems() {
  const supabase = await createClient();
  const nextFriday = getNextFriday();
  const pickupDate = nextFriday.toISOString().split('T')[0];

  const { data: menuItems, error } = await supabase
    .from('menu_schedule')
    .select(`
      *,
      menu_item:menu_items (
        *,
        translations:menu_item_translations (*)
      ),
      inventory:inventory (*)
    `)
    .eq('pickup_date', pickupDate)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }

  return menuItems || [];
}

async function getWeeklyStory() {
  const supabase = await createClient();
  const nextFriday = getNextFriday();
  const pickupDate = nextFriday.toISOString().split('T')[0];

  const { data } = await supabase
    .from('weekly_menu_story')
    .select('*')
    .eq('pickup_date', pickupDate)
    .single();

  return data;
}

export default async function MenuPage() {
  const menuItems = await getMenuItems();
  const weeklyStory = await getWeeklyStory();
  const nextFriday = getNextFriday();
  const cutoffDate = getOrderingCutoff(nextFriday);
  const orderingClosed = isOrderingClosed(cutoffDate);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-pink-50 to-white py-12 lg:py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-4">
              This Week&apos;s Menu
            </h1>
            <p className="text-lg text-neutral-600 mb-6">
              Fresh baked treats available for pickup on{' '}
              <strong className="text-pink-600">{formatDate(nextFriday)}</strong>
            </p>

            {orderingClosed ? (
              <div className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium">
                Ordering is closed for this week. Check back soon for next week&apos;s menu!
              </div>
            ) : (
              <div className="inline-block bg-pink-100 text-pink-700 px-4 py-2 rounded-lg">
                Order by <strong>Wednesday 11:59 PM</strong> for Friday pickup
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Weekly Story */}
      {weeklyStory?.story_en && (
        <section className="py-8">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center bg-pink-50 rounded-xl p-6">
              <p className="text-neutral-700 italic">{weeklyStory.story_en}</p>
            </div>
          </div>
        </section>
      )}

      {/* Menu Grid */}
      <section className="py-12 lg:py-16">
        <div className="container">
          {menuItems.length > 0 ? (
            <MenuGrid
              items={menuItems}
              pickupDate={nextFriday.toISOString().split('T')[0]}
              orderingClosed={orderingClosed}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-500 text-lg">
                No menu items available for this week yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 lg:py-16 bg-neutral-50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-neutral-800 mb-6 text-center">
              How Ordering Works
            </h2>
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  1
                </div>
                <h3 className="font-semibold text-neutral-800 mb-1">
                  Browse & Add
                </h3>
                <p className="text-sm text-neutral-600">
                  Browse the menu and add items to your cart
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  2
                </div>
                <h3 className="font-semibold text-neutral-800 mb-1">
                  Choose Pickup
                </h3>
                <p className="text-sm text-neutral-600">
                  Select your 2-hour pickup window at checkout
                </p>
              </div>
              <div>
                <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  3
                </div>
                <h3 className="font-semibold text-neutral-800 mb-1">
                  Pick Up Friday
                </h3>
                <p className="text-sm text-neutral-600">
                  Collect your fresh treats during your window
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
