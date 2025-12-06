'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, ShoppingBag, Leaf, Wheat, Milk, Nut } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button, Badge, Modal } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import type { Language } from '@/types';

interface MenuItemTranslation {
  id: string;
  menu_item_id: string;
  language: Language;
  name: string;
  description: string;
}

interface MenuItem {
  id: string;
  slug: string;
  base_price: number;
  image_url: string | null;
  dietary_tags: string[];
  category: string | null;
  active: boolean;
  translations: MenuItemTranslation[];
}

interface Inventory {
  id: string;
  menu_item_id: string;
  pickup_date: string;
  daily_cap: number;
  reserved_quantity: number;
}

interface MenuScheduleItem {
  id: string;
  menu_item_id: string;
  pickup_date: string;
  is_active: boolean;
  menu_item: MenuItem;
  inventory: Inventory[];
}

interface MenuGridProps {
  items: MenuScheduleItem[];
  pickupDate: string;
  orderingClosed: boolean;
}

const dietaryIcons: Record<string, React.ReactNode> = {
  vegan: <Leaf className="w-3 h-3" />,
  'gluten-free': <Wheat className="w-3 h-3" />,
  'dairy-free': <Milk className="w-3 h-3" />,
  'nut-free': <Nut className="w-3 h-3" />,
};

export function MenuGrid({ items, pickupDate, orderingClosed }: MenuGridProps) {
  const { addItem, openCart } = useCart();
  const { language } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<MenuScheduleItem | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const getTranslation = (item: MenuItem) => {
    const translation = item.translations?.find((t) => t.language === language);
    return translation || item.translations?.find((t) => t.language === 'en');
  };

  const getAvailableQuantity = (item: MenuScheduleItem) => {
    const inv = item.inventory?.[0];
    if (!inv) return 0;
    return Math.max(0, inv.daily_cap - inv.reserved_quantity);
  };

  const handleAddToCart = (item: MenuScheduleItem, quantity: number = 1) => {
    const translation = getTranslation(item.menu_item);
    addItem({
      menuItemId: item.menu_item.id,
      quantity,
      unitPrice: item.menu_item.base_price,
      name: translation?.name || 'Menu Item',
      imageUrl: item.menu_item.image_url,
    });
    setQuantities((prev) => ({ ...prev, [item.menu_item.id]: 1 }));
    openCart();
  };

  const getQuantity = (itemId: string) => quantities[itemId] || 1;

  const updateQuantity = (itemId: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + delta),
    }));
  };

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-14">
        {items.map((scheduleItem) => {
          const item = scheduleItem.menu_item;
          const translation = getTranslation(item);
          const available = getAvailableQuantity(scheduleItem);
          const isSoldOut = available <= 0;

          return (
            <div
              key={scheduleItem.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-neutral-100"
            >
              {/* Image */}
              <div
                className="aspect-square bg-pink-50 relative cursor-pointer"
                onClick={() => setSelectedItem(scheduleItem)}
              >
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={translation?.name || ''}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-16 h-16 text-pink-200" />
                  </div>
                )}

                {/* Dietary Tags Overlay */}
                {item.dietary_tags?.length > 0 && (
                  <div className="absolute top-4 left-4 flex gap-2">
                    {item.dietary_tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-white/95 backdrop-blur-sm text-pink-700 px-5 py-2.5 rounded-full text-[10px] font-semibold flex items-center gap-1.5 shadow-sm uppercase tracking-wider"
                      >
                        {dietaryIcons[tag]}
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Sold Out Overlay */}
                {isSoldOut && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-white text-neutral-800 px-4 py-2 rounded-lg font-semibold">
                      Sold Out
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3
                  className="font-semibold text-neutral-800 mb-2 cursor-pointer hover:text-pink-600 transition-colors text-[14px]"
                  onClick={() => setSelectedItem(scheduleItem)}
                >
                  {translation?.name}
                </h3>
                <p className="text-[12px] text-neutral-500 line-clamp-2 mb-4 leading-relaxed">
                  {translation?.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-pink-600 font-semibold text-base">
                    {formatCurrency(item.base_price)}
                  </span>

                  {orderingClosed ? (
                    <Badge variant="default">Ordering Closed</Badge>
                  ) : isSoldOut ? (
                    <Badge variant="danger">Sold Out</Badge>
                  ) : (
                    <Button
                      size="xs"
                      onClick={() => handleAddToCart(scheduleItem)}
                    >
                      Add to Cart
                    </Button>
                  )}
                </div>

                {!isSoldOut && available <= 5 && !orderingClosed && (
                  <p className="text-xs text-orange-600 mt-2">
                    Only {available} left!
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          size="lg"
        >
          <div className="grid md:grid-cols-2 gap-14">
            {/* Image */}
            <div className="aspect-square bg-pink-50 rounded-xl relative">
              {selectedItem.menu_item.image_url ? (
                <Image
                  src={selectedItem.menu_item.image_url}
                  alt={getTranslation(selectedItem.menu_item)?.name || ''}
                  fill
                  className="object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-24 h-24 text-pink-200" />
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-6">
                {getTranslation(selectedItem.menu_item)?.name}
              </h2>

              <p className="text-2xl font-semibold text-pink-600 mb-8">
                {formatCurrency(selectedItem.menu_item.base_price)}
              </p>

              {/* Dietary Tags */}
              {selectedItem.menu_item.dietary_tags?.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-8">
                  {selectedItem.menu_item.dietary_tags.map((tag) => (
                    <Badge key={tag} variant="primary">
                      {dietaryIcons[tag]}
                      <span className="ml-1">{tag}</span>
                    </Badge>
                  ))}
                </div>
              )}

              <p className="text-neutral-600 mb-12 leading-loose">
                {getTranslation(selectedItem.menu_item)?.description}
              </p>

              {/* Add to Cart */}
              {!orderingClosed && getAvailableQuantity(selectedItem) > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <span className="text-neutral-600">Quantity:</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          updateQuantity(selectedItem.menu_item.id, -1)
                        }
                        className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-medium text-lg">
                        {getQuantity(selectedItem.menu_item.id)}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(selectedItem.menu_item.id, 1)
                        }
                        className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
                        disabled={
                          getQuantity(selectedItem.menu_item.id) >=
                          getAvailableQuantity(selectedItem)
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <Button
                    fullWidth
                    size="lg"
                    onClick={() => {
                      handleAddToCart(
                        selectedItem,
                        getQuantity(selectedItem.menu_item.id)
                      );
                      setSelectedItem(null);
                    }}
                  >
                    Add to Cart -{' '}
                    {formatCurrency(
                      selectedItem.menu_item.base_price *
                        getQuantity(selectedItem.menu_item.id)
                    )}
                  </Button>

                  {getAvailableQuantity(selectedItem) <= 5 && (
                    <p className="text-sm text-orange-600 text-center">
                      Only {getAvailableQuantity(selectedItem)} left!
                    </p>
                  )}
                </div>
              )}

              {orderingClosed && (
                <div className="bg-neutral-100 rounded-xl p-6 text-center">
                  <p className="text-neutral-600">
                    Ordering is closed for this week
                  </p>
                </div>
              )}

              {!orderingClosed && getAvailableQuantity(selectedItem) <= 0 && (
                <div className="bg-red-50 rounded-xl p-6 text-center">
                  <p className="text-red-600 font-medium">Sold Out</p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
