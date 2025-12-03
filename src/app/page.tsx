import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-pink-50 to-white py-20 lg:py-32">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left">
              <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-6">
                Boutique Home Bakery
              </span>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-neutral-800 leading-[1.1] mb-8">
                Handcrafted Treats,{' '}
                <span className="text-pink-600">Made with Love</span>
              </h1>
              <p className="text-lg text-neutral-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
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
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-10 lg:gap-14">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-3">
                Fresh Weekly Menu
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Our menu rotates weekly with fresh, seasonal flavors. Order by
                Wednesday for Friday pickup.
              </p>
            </div>
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-3">
                Friday Pickups
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Convenient 2-hour pickup windows on Fridays between 10 AM and 6
                PM. Choose the slot that works for you.
              </p>
            </div>
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-3">
                Local & Personal
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Located in Northeast Philadelphia, serving the greater
                Philadelphia area with care and attention to detail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* This Week's Menu Preview */}
      <section className="py-20 lg:py-28 bg-neutral-50">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-5">
              This Week&apos;s Menu
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto text-lg leading-relaxed">
              Discover our freshly baked selection for this week. All items are
              made to order and available for Friday pickup.
            </p>
          </div>

          {/* Menu Preview Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-pink-50 flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-pink-200" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-neutral-800 mb-2 text-lg">
                    Delicious Treat {i}
                  </h3>
                  <p className="text-sm text-neutral-500 mb-4 leading-relaxed">
                    A delightful treat made with the finest ingredients
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-pink-600 font-semibold text-lg">$4.50</span>
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
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="bg-gradient-to-r from-pink-600 to-pink-500 rounded-3xl p-10 lg:p-16 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Planning a Special Celebration?
            </h2>
            <p className="text-pink-100 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
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
      <section className="py-20 lg:py-28 bg-neutral-50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-pink-100 flex items-center justify-center">
              <Sparkles className="w-24 h-24 text-pink-300" />
            </div>
            <div>
              <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-6">
                Our Story
              </span>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-6">
                Baking with Passion Since Day One
              </h2>
              <p className="text-neutral-600 mb-5 leading-relaxed text-lg">
                Guiltless Cakes started as a passion project in a home kitchen
                and has grown into a beloved local bakery. We believe in using
                quality ingredients, traditional techniques, and a whole lot of
                love in everything we bake.
              </p>
              <p className="text-neutral-600 mb-8 leading-relaxed text-lg">
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
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-5">
              How It Works
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto text-lg">
              Ordering from Guiltless Cakes is simple and convenient.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-10 lg:gap-12">
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
                <div className="w-14 h-14 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-5 text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-neutral-800 mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
