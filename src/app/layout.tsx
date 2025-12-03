import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Guiltless Cakes | Boutique Home Bakery in Northeast Philadelphia',
    template: '%s | Guiltless Cakes',
  },
  description:
    'A boutique home bakery in Northeast Philadelphia specializing in cupcakes, slices, and custom celebration cakes. Order from our weekly rotating menu or inquire about custom cakes for your special events.',
  keywords: [
    'bakery',
    'cupcakes',
    'custom cakes',
    'Philadelphia',
    'Northeast Philadelphia',
    'celebration cakes',
    'wedding cakes',
    'birthday cakes',
  ],
  authors: [{ name: 'Guiltless Cakes' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://guiltlesscakes.com',
    siteName: 'Guiltless Cakes',
    title: 'Guiltless Cakes | Boutique Home Bakery',
    description:
      'A boutique home bakery in Northeast Philadelphia specializing in cupcakes, slices, and custom celebration cakes.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guiltless Cakes | Boutique Home Bakery',
    description:
      'A boutique home bakery in Northeast Philadelphia specializing in cupcakes, slices, and custom celebration cakes.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </Providers>
      </body>
    </html>
  );
}
