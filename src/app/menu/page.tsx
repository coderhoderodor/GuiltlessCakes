import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { MenuGrid } from '@/components/menu/MenuGrid';
import { getNextFriday, getOrderingCutoff, isOrderingClosed, formatDate } from '@/lib/utils';

// Dummy menu items for development/demo purposes
const DUMMY_MENU_ITEMS = [
  {
    id: 'schedule-1',
    menu_item_id: 'item-1',
    pickup_date: '',
    is_active: true,
    menu_item: {
      id: 'item-1',
      slug: 'classic-vanilla-cupcake',
      base_price: 4.50,
      image_url: null,
      dietary_tags: ['vegan'],
      category: 'cupcakes',
      active: true,
      translations: [{
        id: 'trans-1',
        menu_item_id: 'item-1',
        language: 'en' as const,
        name: 'Classic Vanilla Cupcake',
        description: 'Light and fluffy vanilla cake topped with our signature buttercream frosting. A timeless favorite made with love.'
      }]
    },
    inventory: [{
      id: 'inv-1',
      menu_item_id: 'item-1',
      pickup_date: '',
      daily_cap: 24,
      reserved_quantity: 3
    }]
  },
  {
    id: 'schedule-2',
    menu_item_id: 'item-2',
    pickup_date: '',
    is_active: true,
    menu_item: {
      id: 'item-2',
      slug: 'chocolate-fudge-brownie',
      base_price: 5.00,
      image_url: null,
      dietary_tags: ['gluten-free'],
      category: 'brownies',
      active: true,
      translations: [{
        id: 'trans-2',
        menu_item_id: 'item-2',
        language: 'en' as const,
        name: 'Chocolate Fudge Brownie',
        description: 'Rich, decadent brownie with a fudgy center and crackly top. Pure chocolate indulgence in every bite.'
      }]
    },
    inventory: [{
      id: 'inv-2',
      menu_item_id: 'item-2',
      pickup_date: '',
      daily_cap: 18,
      reserved_quantity: 5
    }]
  },
  {
    id: 'schedule-3',
    menu_item_id: 'item-3',
    pickup_date: '',
    is_active: true,
    menu_item: {
      id: 'item-3',
      slug: 'lemon-blueberry-slice',
      base_price: 4.75,
      image_url: null,
      dietary_tags: [],
      category: 'slices',
      active: true,
      translations: [{
        id: 'trans-3',
        menu_item_id: 'item-3',
        language: 'en' as const,
        name: 'Lemon Blueberry Slice',
        description: 'Zesty lemon cake studded with fresh blueberries, finished with a light lemon glaze. Bright and refreshing.'
      }]
    },
    inventory: [{
      id: 'inv-3',
      menu_item_id: 'item-3',
      pickup_date: '',
      daily_cap: 16,
      reserved_quantity: 2
    }]
  },
  {
    id: 'schedule-4',
    menu_item_id: 'item-4',
    pickup_date: '',
    is_active: true,
    menu_item: {
      id: 'item-4',
      slug: 'red-velvet-cupcake',
      base_price: 5.25,
      image_url: null,
      dietary_tags: [],
      category: 'cupcakes',
      active: true,
      translations: [{
        id: 'trans-4',
        menu_item_id: 'item-4',
        language: 'en' as const,
        name: 'Red Velvet Cupcake',
        description: 'Classic southern red velvet with a hint of cocoa, crowned with tangy cream cheese frosting.'
      }]
    },
    inventory: [{
      id: 'inv-4',
      menu_item_id: 'item-4',
      pickup_date: '',
      daily_cap: 20,
      reserved_quantity: 8
    }]
  },
];

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
      )
    `)
    .eq('pickup_date', pickupDate)
    .eq('is_active', true);

  // Fetch inventory separately for the pickup date
  const { data: inventoryData } = await supabase
    .from('inventory')
    .select('*')
    .eq('pickup_date', pickupDate);

  if (error) {
    console.error('Error fetching menu items:', error);
  }

  // Return database items if available, otherwise use dummy data
  if (menuItems && menuItems.length > 0) {
    // Merge inventory data with menu items
    return menuItems.map(item => ({
      ...item,
      inventory: inventoryData?.filter(inv => inv.menu_item_id === item.menu_item_id) || []
    }));
  }

  // Return dummy data with current pickup date
  return DUMMY_MENU_ITEMS.map(item => ({
    ...item,
    pickup_date: pickupDate,
    inventory: item.inventory.map(inv => ({ ...inv, pickup_date: pickupDate }))
  }));
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
      <section className="bg-gradient-to-b from-pink-50 to-white py-10 lg:py-14">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
              This Week&apos;s Menu
            </h1>
            <p className="text-base text-neutral-600 mb-6 leading-relaxed">
              Fresh baked treats available for pickup on{' '}
              <strong className="text-pink-600">{formatDate(nextFriday)}</strong>
            </p>

            {orderingClosed ? (
              <div className="inline-block bg-red-100 text-red-700 px-5 py-2.5 rounded-xl font-medium">
                Ordering is closed for this week. Check back soon for next week&apos;s menu!
              </div>
            ) : (
              <div className="inline-block bg-pink-100 text-pink-700 px-5 py-2.5 rounded-xl">
                Order by <strong>Wednesday 11:59 PM</strong> for Friday pickup
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Weekly Story */}
      {weeklyStory?.story_en && (
        <section className="py-10">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center bg-pink-50 rounded-2xl p-14">
              <p className="text-neutral-700 italic text-lg leading-relaxed">{weeklyStory.story_en}</p>
            </div>
          </div>
        </section>
      )}

      {/* Menu Grid */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-8 lg:p-12">
            {menuItems.length > 0 ? (
              <MenuGrid
                items={menuItems}
                pickupDate={nextFriday.toISOString().split('T')[0]}
                orderingClosed={orderingClosed}
              />
            ) : (
              <div className="text-center py-20">
                <p className="text-neutral-500 text-lg">
                  No menu items available for this week yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 lg:py-24 bg-neutral-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800 mb-20 text-center">
              How Ordering Works
            </h2>
            <div className="grid sm:grid-cols-3 gap-16 text-center">
              <div className="p-10">
                <div className="w-20 h-20 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-10 text-2xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-neutral-800 mb-6 text-lg">
                  Browse & Add
                </h3>
                <p className="text-neutral-600 leading-loose">
                  Browse the menu and add items to your cart
                </p>
              </div>
              <div className="p-10">
                <div className="w-20 h-20 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-10 text-2xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-neutral-800 mb-6 text-lg">
                  Choose Pickup
                </h3>
                <p className="text-neutral-600 leading-loose">
                  Select your 2-hour pickup window at checkout
                </p>
              </div>
              <div className="p-10">
                <div className="w-20 h-20 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-10 text-2xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-neutral-800 mb-6 text-lg">
                  Pick Up Friday
                </h3>
                <p className="text-neutral-600 leading-loose">
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
