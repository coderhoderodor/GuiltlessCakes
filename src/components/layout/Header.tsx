'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ShoppingBag, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useLanguage, translations } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { NAV_LINKS, SUPPORTED_LANGUAGES } from '@/lib/constants';
import { Button } from '@/components/ui';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const { toggleCart, itemCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, isAdmin, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-100 animate-fadeIn">
      <div className="container">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl lg:text-2xl font-bold text-pink-600">
              Guiltless Cakes
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-12">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-neutral-600 hover:text-pink-600 transition-colors font-medium text-[15px]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6 lg:gap-10">
            {/* Language Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1 px-2 py-1 text-sm text-neutral-600 hover:text-neutral-800 transition-colors"
              >
                {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.flag}
                <ChevronDown className="w-4 h-4" />
              </button>
              {isLangMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsLangMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-44 bg-white rounded-xl shadow-lg border border-neutral-100 py-2 z-20">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as 'en' | 'es' | 'pt');
                          setIsLangMenuOpen(false);
                        }}
                        className={cn(
                          'w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-pink-50 transition-colors',
                          language === lang.code && 'bg-pink-50 text-pink-600'
                        )}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-neutral-600 hover:text-pink-600 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 text-neutral-600 hover:text-pink-600 transition-colors"
                >
                  <User className="w-6 h-6" />
                  <span className="text-sm font-medium">
                    {profile?.first_name || 'Account'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-lg border border-neutral-100 py-2 z-20">
                      <Link
                        href="/account/orders"
                        className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-pink-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t(translations.nav.orders)}
                      </Link>
                      <Link
                        href="/account/settings"
                        className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-pink-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t(translations.nav.settings)}
                      </Link>
                      {isAdmin && (
                        <>
                          <hr className="my-2 border-neutral-100" />
                          <Link
                            href="/admin"
                            className="block px-4 py-2.5 text-sm text-pink-600 font-medium hover:bg-pink-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        </>
                      )}
                      <hr className="my-2 border-neutral-100" />
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-pink-50 transition-colors"
                      >
                        {t(translations.nav.signOut)}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="hidden lg:block">
                <Button variant="outline" size="sm">
                  {t(translations.nav.signIn)}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-600"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-100 py-6 animate-slideUp">
            <nav className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-4 text-neutral-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-4 border-neutral-100" />
              {isAuthenticated ? (
                <>
                  <Link
                    href="/account/orders"
                    className="px-4 py-4 text-neutral-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t(translations.nav.orders)}
                  </Link>
                  <Link
                    href="/account/settings"
                    className="px-4 py-4 text-neutral-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t(translations.nav.settings)}
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="px-4 py-4 text-pink-600 font-medium hover:bg-pink-50 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-4 text-left text-neutral-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                  >
                    {t(translations.nav.signOut)}
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-4 py-4 text-pink-600 font-medium hover:bg-pink-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(translations.nav.signIn)}
                </Link>
              )}
              <hr className="my-4 border-neutral-100" />
              <div className="px-4 flex gap-3">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as 'en' | 'es' | 'pt')}
                    className={cn(
                      'px-5 py-2.5 text-[10px] rounded-full transition-colors uppercase tracking-wider font-medium',
                      language === lang.code
                        ? 'bg-pink-100 text-pink-600'
                        : 'bg-neutral-100 text-neutral-600'
                    )}
                  >
                    {lang.flag} {lang.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
