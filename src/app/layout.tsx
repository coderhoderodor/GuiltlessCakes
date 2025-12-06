import type { Metadata } from 'next';
import { Meow_Script, Josefin_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageTransition } from '@/components/layout/PageTransition';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const meowScript = Meow_Script({
  variable: '--font-meow-script',
  subsets: ['latin'],
  weight: '400',
});

const josefinSans = Josefin_Sans({
  variable: '--font-josefin-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Guiltless Sweets | Boutique Home Bakery in Northeast Philadelphia',
    template: '%s | Guiltless Sweets',
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
  authors: [{ name: 'Guiltless Sweets' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://guiltlesssweets.com',
    siteName: 'Guiltless Sweets',
    title: 'Guiltless Sweets | Boutique Home Bakery',
    description:
      'A boutique home bakery in Northeast Philadelphia specializing in cupcakes, slices, and custom celebration cakes.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guiltless Sweets | Boutique Home Bakery',
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
        className={`${meowScript.variable} ${josefinSans.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <ErrorBoundary>
            <Header />
            <main className="flex-1">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <CartDrawer />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
