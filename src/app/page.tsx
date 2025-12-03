import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-[#fff0f5] pt-24 pb-32 lg:pt-40 lg:pb-48 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-pink-200/30 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-pink-300/20 rounded-full blur-3xl opacity-60 pointer-events-none" />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border border-pink-100 text-pink-700 rounded-full text-sm font-medium mb-8 animate-fadeIn">
                <Sparkles className="w-4 h-4" />
                <span>Boutique Home Bakery</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-neutral-900 leading-[1.1] mb-8 tracking-tight animate-slideUp">
                Handcrafted Treats, <br />
                <span className="text-pink-600 italic font-serif">Made with Love</span>
              </h1>

              <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light animate-slideUp" style={{ animationDelay: '0.1s' }}>
                Welcome to Guiltless Cakes, a boutique home bakery in Northeast
                Philadelphia. We specialize in delicious cupcakes, slices, and
                stunning custom celebration cakes for your special moments.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start animate-slideUp" style={{ animationDelay: '0.2s' }}>
                <Link href="/menu">
                  <Button size="lg" className="shadow-pink-200/50 shadow-lg hover:shadow-pink-300/50">
                    View This Week&apos;s Menu
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/custom-cakes">
                  <Button variant="outline" size="lg" className="bg-white/50 backdrop-blur-sm border-pink-200 hover:bg-white">
                    Custom Cake Inquiry
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="relative z-10 aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl shadow-pink-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-100 to-white flex items-center justify-center">
                  <Sparkles className="w-32 h-32 text-pink-200" />
                </div>
                {/* Placeholder for actual image */}
                {/* <Image src="/hero-cake.jpg" alt="Delicious Cake" fill className="object-cover" /> */}
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-pink-100 rounded-full opacity-50 blur-2xl -z-10" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-pink-200 rounded-full opacity-40 blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-white relative">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            <div className="group text-center p-8 rounded-3xl hover:bg-neutral-50 transition-colors duration-300">
              <div className="w-20 h-20 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-pink-500" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4 font-serif">
                Fresh Weekly Menu
              </h3>
              <p className="text-neutral-600 leading-relaxed text-lg font-light">
                Our menu rotates weekly with fresh, seasonal flavors. Order by
                Wednesday for Friday pickup.
              </p>
            </div>

            <div className="group text-center p-8 rounded-3xl hover:bg-neutral-50 transition-colors duration-300">
              <div className="w-20 h-20 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-10 h-10 text-pink-500" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4 font-serif">
                Friday Pickups
              </h3>
              <p className="text-neutral-600 leading-relaxed text-lg font-light">
                Convenient 2-hour pickup windows on Fridays between 10 AM and 6
                PM. Choose the slot that works for you.
              </p>
            </div>

            <div className="group text-center p-8 rounded-3xl hover:bg-neutral-50 transition-colors duration-300">
              <div className="w-20 h-20 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-10 h-10 text-pink-500" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-4 font-serif">
                Local & Personal
              </h3>
              <p className="text-neutral-600 leading-relaxed text-lg font-light">
                Located in Northeast Philadelphia, serving the greater
                Philadelphia area with care and attention to detail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* This Week's Menu Preview */}
      <section className="py-24 lg:py-32 bg-neutral-50/50">
        <div className="container">
          <div className="text-center mb-20">
            <span className="text-pink-600 font-medium tracking-wider uppercase text-sm mb-4 block">Fresh From The Oven</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 font-serif">
              This Week&apos;s Menu
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto text-xl leading-relaxed font-light">
              Discover our freshly baked selection for this week. All items are
              made to order and available for Friday pickup.
            </p>
          </div>

          {/* Menu Preview Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-neutral-100"
              >
                <div className="aspect-square bg-pink-50 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-pink-100/50 group-hover:bg-pink-100/30 transition-colors duration-300" />
                  <Sparkles className="w-16 h-16 text-pink-200 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-neutral-900 text-xl font-serif">
                      Delicious Treat {i}
                    </h3>
                    <span className="text-pink-600 font-bold text-lg bg-pink-50 px-3 py-1 rounded-full">$4.50</span>
                  </div>
                  <p className="text-neutral-500 mb-6 leading-relaxed">
                    A delightful treat made with the finest ingredients, perfect for your sweet cravings.
                  </p>
                  <Button size="sm" variant="outline" className="w-full hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200">Add to Cart</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/menu">
              <Button variant="outline" size="lg" className="border-neutral-300 hover:border-neutral-800 hover:bg-neutral-800 hover:text-white transition-all duration-300">
                View Full Menu
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Cakes CTA */}
      <section className="py-24 lg:py-32">
        <div className="container">
          <div className="relative rounded-[3rem] overflow-hidden bg-pink-900 text-white p-12 lg:p-24 text-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 0 C 50 100 80 100 100 0 Z" fill="white" />
              </svg>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-4xl lg:text-6xl font-bold mb-8 font-serif">
                Planning a Special Celebration?
              </h2>
              <p className="text-pink-100 mb-12 text-xl leading-relaxed font-light max-w-2xl mx-auto">
                Let us create the perfect custom cake for your birthday, wedding,
                anniversary, or any special occasion. We&apos;ll work with you to
                bring your vision to life.
              </p>
              <Link href="/custom-cakes">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-pink-900 hover:bg-pink-50 border-none shadow-xl shadow-pink-900/20"
                >
                  Start Custom Cake Inquiry
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="order-2 lg:order-1">
              <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-700 rounded-full text-sm font-medium mb-8">
                Our Story
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-8 font-serif leading-tight">
                Baking with Passion <br />Since Day One
              </h2>
              <div className="prose prose-lg text-neutral-600 font-light">
                <p>
                  Guiltless Cakes started as a passion project in a home kitchen
                  and has grown into a beloved local bakery. We believe in using
                  quality ingredients, traditional techniques, and a whole lot of
                  love in everything we bake.
                </p>
                <p>
                  Every cupcake, slice, and custom cake is crafted with care,
                  ensuring each bite brings joy to our customers. We&apos;re proud
                  to serve the Northeast Philadelphia community and beyond.
                </p>
              </div>
              <div className="mt-10">
                <Link href="/about">
                  <Button variant="outline" className="border-pink-200 text-pink-700 hover:bg-pink-50">
                    Learn More About Us
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-neutral-100 relative z-10 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl shadow-neutral-200">
                <div className="absolute inset-0 flex items-center justify-center bg-pink-50">
                  <Sparkles className="w-32 h-32 text-pink-200" />
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-pink-100 rounded-full blur-3xl opacity-60 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 lg:py-32 bg-neutral-50/50">
        <div className="container">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 font-serif">
              How It Works
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto text-xl font-light">
              Ordering from Guiltless Cakes is simple and convenient.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-pink-200 -z-10" />

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
              <div key={index} className="text-center group">
                <div className="w-24 h-24 bg-white border-4 border-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-8 text-2xl font-bold shadow-lg group-hover:scale-110 group-hover:border-pink-300 transition-all duration-300">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-4 font-serif">
                  {item.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed font-light">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
