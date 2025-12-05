import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 lg:pt-24 lg:pb-28 overflow-hidden bg-pink-50">
        {/* Animated Flowers - Grouped and Rotated */}
        <div className="absolute right-[5%] top-[5%] w-[500px] h-[400px]" style={{ transform: 'rotate(-20deg)' }}>
          <svg className="absolute right-[55%] top-[40%] w-96 h-96 z-20 animate-flowerBloom" style={{ animationDelay: '0.3s', transform: 'rotate(20deg)' }} viewBox="0 0 100 100">
            <circle cx="50" cy="30" r="15" fill="#fda4b4" />
            <circle cx="30" cy="50" r="15" fill="#fda4b4" />
            <circle cx="70" cy="50" r="15" fill="#fda4b4" />
            <circle cx="40" cy="70" r="15" fill="#fda4b4" />
            <circle cx="60" cy="70" r="15" fill="#fda4b4" />
            <circle cx="50" cy="50" r="12" fill="#e11d53" />
          </svg>
          <svg className="absolute right-[25%] top-[20%] w-80 h-80 animate-flowerBloom" style={{ animationDelay: '0.5s' }} viewBox="0 0 100 100">
            <circle cx="50" cy="30" r="15" fill="#fecdd6" />
            <circle cx="30" cy="50" r="15" fill="#fecdd6" />
            <circle cx="70" cy="50" r="15" fill="#fecdd6" />
            <circle cx="40" cy="70" r="15" fill="#fecdd6" />
            <circle cx="60" cy="70" r="15" fill="#fecdd6" />
            <circle cx="50" cy="50" r="12" fill="#f472b6" />
          </svg>
          <svg className="absolute right-[0%] top-[35%] w-48 h-48 animate-flowerBloom" style={{ animationDelay: '0.7s' }} viewBox="0 0 100 100">
            <circle cx="50" cy="30" r="15" fill="#fbcfe8" />
            <circle cx="30" cy="50" r="15" fill="#fbcfe8" />
            <circle cx="70" cy="50" r="15" fill="#fbcfe8" />
            <circle cx="40" cy="70" r="15" fill="#fbcfe8" />
            <circle cx="60" cy="70" r="15" fill="#fbcfe8" />
            <circle cx="50" cy="50" r="12" fill="#ec4899" />
          </svg>
        </div>

        {/* Hero Image Overlay */}
        <img
          src="/HeroFran.png"
          alt=""
          className="absolute right-0 -top-16 w-[85%] h-auto object-contain z-10 animate-heroReveal"
          style={{ animationDelay: '0.4s' }}
        />
        <div className="container relative z-10">
          <div className="flex flex-col items-start text-left max-w-xl">
              <h1 className="text-6xl lg:text-7xl font-bold text-neutral-900 leading-[1.1] mb-8 tracking-tight animate-slideUp" style={{ animationDelay: '0.1s' }}>
                Baked with <span className="text-pink-600 italic font-serif">Love</span>
              </h1>

              <p className="text-xl text-neutral-600 mb-10 leading-relaxed font-light animate-slideUp" style={{ animationDelay: '0.3s' }}>
                Welcome to Guiltless Cakes, a boutique home bakery in Northeast
                Philadelphia. We specialize in delicious cupcakes, slices, and
                stunning custom celebration cakes for your special moments.
              </p>

              <div className="flex flex-col gap-4 items-start animate-slideUp" style={{ animationDelay: '0.5s' }}>
                <Link href="/menu">
                  <Button className="shadow-pink-200/50 shadow-lg hover:shadow-pink-300/50 text-[11px] !px-8 !py-4 !rounded-full">
                    View This Week&apos;s Menu
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/custom-cakes">
                  <Button variant="outline" className="bg-white/50 backdrop-blur-sm border-pink-200 hover:bg-white text-[11px] !px-8 !py-4 !rounded-full">
                    Custom Cake Inquiry
                  </Button>
                </Link>
              </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 lg:py-16 bg-white relative">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-16 lg:gap-20">
            <div className="group text-center p-12 rounded-[2.5rem] hover:bg-neutral-50 transition-colors duration-300">
              <div className="w-24 h-24 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-12 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-12 h-12 text-pink-500" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-8 font-serif">
                Fresh Weekly Menu
              </h3>
              <p className="text-neutral-600 leading-loose text-base font-light">
                Our menu rotates weekly with fresh, seasonal flavors. Order by
                Wednesday for Friday pickup.
              </p>
            </div>

            <div className="group text-center p-12 rounded-[2.5rem] hover:bg-neutral-50 transition-colors duration-300">
              <div className="w-24 h-24 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-12 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-12 h-12 text-pink-500" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-8 font-serif">
                Friday Pickups
              </h3>
              <p className="text-neutral-600 leading-loose text-base font-light">
                Convenient 2-hour pickup windows on Fridays between 10 AM and 6
                PM. Choose the slot that works for you.
              </p>
            </div>

            <div className="group text-center p-12 rounded-[2.5rem] hover:bg-neutral-50 transition-colors duration-300">
              <div className="w-24 h-24 bg-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-12 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="w-12 h-12 text-pink-500" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 mb-8 font-serif">
                Local & Personal
              </h3>
              <p className="text-neutral-600 leading-loose text-base font-light">
                Located in Northeast Philadelphia, serving the greater
                Philadelphia area with care and attention to detail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* This Week's Menu Preview */}
      <section className="py-16 lg:py-20 bg-neutral-50/50">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-pink-600 font-medium tracking-wider uppercase text-[10px] mb-4 block">Fresh From The Oven</span>
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-8 font-serif">
              This Week&apos;s Menu
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto text-xl leading-loose font-light">
              Discover our freshly baked selection for this week. All items are
              made to order and available for Friday pickup.
            </p>
          </div>

          {/* Menu Preview Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 mb-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-neutral-100"
              >
                <div className="aspect-square bg-pink-50 flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-pink-100/50 group-hover:bg-pink-100/30 transition-colors duration-300" />
                  <Sparkles className="w-16 h-16 text-pink-200 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-10">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-bold text-neutral-900 text-[15px] font-serif">
                      Delicious Treat {i}
                    </h3>
                    <span className="text-pink-600 font-bold text-[10px] bg-pink-50 px-6 py-3 rounded-full">$4.50</span>
                  </div>
                  <p className="text-neutral-500 mb-10 leading-loose text-[13px]">
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
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="relative rounded-[3rem] overflow-hidden bg-pink-900 text-white p-20 lg:p-32 text-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 0 C 50 100 80 100 100 0 Z" fill="white" />
              </svg>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-4xl lg:text-6xl font-bold mb-12 font-serif">
                Planning a Special Celebration?
              </h2>
              <p className="text-pink-100 mb-16 text-xl leading-loose font-light max-w-2xl mx-auto">
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
      <section className="py-16 lg:py-20 bg-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-20 lg:gap-28 items-center">
            <div className="order-2 lg:order-1">
              <span className="inline-block px-6 py-3 bg-pink-100 text-pink-700 rounded-full text-[10px] font-medium mb-10 uppercase tracking-wider">
                Our Story
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-10 font-serif leading-tight">
                Baking with Passion <br />Since Day One
              </h2>
              <div className="prose prose-lg text-neutral-600 font-light leading-loose">
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
              <div className="mt-14">
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
      <section className="py-16 lg:py-20 bg-neutral-50/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4 font-serif">
              How It Works
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto text-xl font-light leading-loose">
              Ordering from Guiltless Cakes is simple and convenient.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-16 relative">
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
                <div className="w-24 h-24 bg-white border-4 border-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-12 text-2xl font-bold shadow-lg group-hover:scale-110 group-hover:border-pink-300 transition-all duration-300">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-6 font-serif">
                  {item.title}
                </h3>
                <p className="text-neutral-600 leading-loose font-light">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
