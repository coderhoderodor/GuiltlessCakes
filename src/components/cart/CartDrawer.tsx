'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage, translations } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';

export function CartDrawer() {
  const { cart, closeCart, removeItem, updateQuantity, subtotal } = useCart();
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  if (!cart.isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col animate-slideIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            {t(translations.cart.title)}
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors rounded-lg hover:bg-neutral-100"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-neutral-300 mb-4" />
              <p className="text-neutral-500 mb-4">{t(translations.cart.empty)}</p>
              <Button variant="outline" onClick={closeCart}>
                {t(translations.cart.continueShopping)}
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {cart.items.map((item) => (
                <li
                  key={item.menuItemId}
                  className="flex gap-4 p-3 bg-neutral-50 rounded-lg"
                >
                  {/* Item Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-200">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-neutral-800 truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-pink-600 font-medium">
                      {formatCurrency(item.unitPrice)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.menuItemId, item.quantity - 1)
                        }
                        className="p-1 rounded-md hover:bg-neutral-200 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.menuItemId, item.quantity + 1)
                        }
                        className="p-1 rounded-md hover:bg-neutral-200 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.menuItemId)}
                        className="ml-auto p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <span className="font-medium text-neutral-800">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t border-neutral-100 p-4 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-lg">
              <span className="text-neutral-600">{t(translations.cart.subtotal)}</span>
              <span className="font-semibold text-neutral-800">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Tax and service fee calculated at checkout
            </p>

            {/* Checkout Button */}
            {isAuthenticated ? (
              <Link href="/checkout" onClick={closeCart}>
                <Button fullWidth size="lg">
                  {t(translations.cart.checkout)}
                </Button>
              </Link>
            ) : (
              <Link
                href="/auth/login?redirectTo=/checkout"
                onClick={closeCart}
              >
                <Button fullWidth size="lg">
                  Sign in to Checkout
                </Button>
              </Link>
            )}

            {/* Continue Shopping */}
            <Button
              variant="ghost"
              fullWidth
              onClick={closeCart}
            >
              {t(translations.cart.continueShopping)}
            </Button>
          </div>
        )}
      </div>
    </Fragment>
  );
}
