import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-pink-50 to-white py-16 lg:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <span className="inline-block px-4 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-4">
                Boutique Home Bakery
              </span>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-neutral-800 leading-tight mb-6">
                Handcrafted Treats,{' '}
                <span className="text-pink-600">Made with Love</span>
              </h1>
              <p className="text-lg text-neutral-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Welcome to Guiltless Cakes, a boutique home bakery in Northeast
                Philadelphia. We specialize in delicious cupcakes, slices, and
                stunning custom celebration cakes for your special moments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/menu">
                  <Button size="lg">
                    View This Week&apos;s Menu
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/custom-cakes">
                  <Button variant="outline" size="lg">
                    Custom Cake Inquiry
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto lg:max-w-none rounded-2xl overflow-hidden bg-pink-100">
                <div className="w-full h-full flex items-center justify-center">
                  <Sparkles className="w-24 h-24 text-pink-300" />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-pink-200 rounded-full opacity-50 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-pink-300 rounded-full opacity-40 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Fresh Weekly Menu
              </h3>
              <p className="text-neutral-600">
                Our menu rotates weekly with fresh, seasonal flavors. Order by
                Wednesday for Friday pickup.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Friday Pickups
              </h3>
              <p className="text-neutral-600">
                Convenient 2-hour pickup windows on Fridays between 10 AM and 6
                PM. Choose the slot that works for you.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Local & Personal
              </h3>
              <p className="text-neutral-600">
                Located in Northeast Philadelphia, serving the greater
                Philadelphia area with care and attention to detail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* This Week's Menu Preview */}
      <section className="py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
              This Week&apos;s Menu
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Discover our freshly baked selection for this week. All items are
              made to order and available for Friday pickup.
            </p>
          </div>

          {/* Menu Preview Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-pink-50 flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-pink-200" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-neutral-800 mb-1">
                    Delicious Treat {i}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-2">
                    A delightful treat made with the finest ingredients
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-pink-600 font-semibold">$4.50</span>
                    <Button size="sm">Add to Cart</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/menu">
              <Button variant="outline" size="lg">
                View Full Menu
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Cakes CTA */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="bg-gradient-to-r from-pink-600 to-pink-500 rounded-2xl p-8 lg:p-12 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Planning a Special Celebration?
            </h2>
            <p className="text-pink-100 mb-8 max-w-2xl mx-auto">
              Let us create the perfect custom cake for your birthday, wedding,
              anniversary, or any special occasion. We&apos;ll work with you to
              bring your vision to life.
            </p>
            <Link href="/custom-cakes">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-pink-600 hover:bg-pink-50"
              >
                Start Custom Cake Inquiry
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-pink-100 flex items-center justify-center">
              <Sparkles className="w-24 h-24 text-pink-300" />
            </div>
            <div>
              <span className="inline-block px-4 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-4">
                Our Story
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
                Baking with Passion Since Day One
              </h2>
              <p className="text-neutral-600 mb-6">
                Guiltless Cakes started as a passion project in a home kitchen
                and has grown into a beloved local bakery. We believe in using
                quality ingredients, traditional techniques, and a whole lot of
                love in everything we bake.
              </p>
              <p className="text-neutral-600 mb-8">
                Every cupcake, slice, and custom cake is crafted with care,
                ensuring each bite brings joy to our customers. We&apos;re proud
                to serve the Northeast Philadelphia community and beyond.
              </p>
              <Link href="/about">
                <Button variant="outline">
                  Learn More About Us
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
              How It Works
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Ordering from Guiltless Cakes is simple and convenient.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Browse Menu',
                description: "Check out this week's rotating menu selection",
              },
              {
                step: '2',
                title: 'Add to Cart',
                description: 'Select your favorite items and quantities',
              },
              {
                step: '3',
                title: 'Choose Pickup',
                description: 'Select your preferred 2-hour pickup window',
              },
              {
                step: '4',
                title: 'Enjoy!',
                description: 'Pick up your fresh treats on Friday',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-neutral-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
