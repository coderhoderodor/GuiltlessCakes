'use client';

import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage, translations } from '@/contexts/LanguageContext';
import { SOCIAL_LINKS } from '@/lib/constants';

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-50 border-t border-neutral-100">
      <div className="container py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-xl font-bold text-pink-600">
                Guiltless Cakes
              </span>
            </Link>
            <p className="mt-5 text-neutral-600 text-sm leading-relaxed">
              {t(translations.footer.madeWith)}
            </p>
            <div className="mt-7 flex gap-4">
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-neutral-400 hover:text-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-neutral-400 hover:text-pink-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-neutral-800 mb-5">Quick Links</h3>
            <ul className="space-y-3.5">
              <li>
                <Link
                  href="/menu"
                  className="text-neutral-600 hover:text-pink-600 transition-colors text-sm"
                >
                  Weekly Menu
                </Link>
              </li>
              <li>
                <Link
                  href="/custom-cakes"
                  className="text-neutral-600 hover:text-pink-600 transition-colors text-sm"
                >
                  Custom Cakes
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-neutral-600 hover:text-pink-600 transition-colors text-sm"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/pickup"
                  className="text-neutral-600 hover:text-pink-600 transition-colors text-sm"
                >
                  Pickup Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-neutral-800 mb-5">Contact</h3>
            <ul className="space-y-3.5">
              <li>
                <a
                  href="mailto:hello@guiltlesscakes.com"
                  className="flex items-center gap-2 text-neutral-600 hover:text-pink-600 transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  hello@guiltlesscakes.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+12155550123"
                  className="flex items-center gap-2 text-neutral-600 hover:text-pink-600 transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" />
                  (215) 555-0123
                </a>
              </li>
              <li>
                <span className="flex items-center gap-2 text-neutral-600 text-sm">
                  <MapPin className="w-4 h-4" />
                  Northeast Philadelphia, PA
                </span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="font-semibold text-neutral-800 mb-5">Pickup Hours</h3>
            <p className="text-neutral-600 text-sm leading-relaxed">
              <strong>Fridays Only</strong>
              <br />
              10:00 AM - 6:00 PM
            </p>
            <p className="mt-5 text-neutral-500 text-xs leading-relaxed">
              Orders must be placed by Wednesday 11:59 PM for Friday pickup.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-neutral-500 text-sm">
              &copy; {currentYear} Guiltless Cakes. {t(translations.footer.rights)}.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-neutral-500 hover:text-pink-600 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-neutral-500 hover:text-pink-600 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
