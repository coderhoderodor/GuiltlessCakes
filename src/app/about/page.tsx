import { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Award, Users, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Guiltless Cakes, a boutique home bakery in Northeast Philadelphia. Discover our story, our passion for baking, and our commitment to quality.',
};

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-pink-50 to-white py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 bg-pink-100 text-pink-600 rounded-full text-sm font-medium mb-4">
              Our Story
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
              Baking with Love, One Treat at a Time
            </h1>
            <p className="text-lg text-neutral-600">
              Welcome to Guiltless Cakes, where every treat is crafted with
              passion, care, and the finest ingredients. We&apos;re more than just
              a bakery - we&apos;re a family dedicated to bringing sweetness to
              your special moments.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-pink-100 flex items-center justify-center">
              <Sparkles className="w-24 h-24 text-pink-300" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-neutral-800 mb-6">
                From Home Kitchen to Beloved Bakery
              </h2>
              <div className="space-y-4 text-neutral-600">
                <p>
                  Guiltless Cakes began as a passion project in a small home
                  kitchen in Northeast Philadelphia. What started as baking for
                  family and friends quickly grew into something much bigger as
                  word spread about our delicious treats.
                </p>
                <p>
                  Our philosophy is simple: use the best ingredients, take the
                  time to get it right, and put love into every single item we
                  bake. We believe that the best treats are made with care and
                  attention to detail, not shortcuts.
                </p>
                <p>
                  Today, we continue to operate from our home bakery, serving
                  the greater Philadelphia area with our weekly rotating menu of
                  cupcakes, slices, and pre-made cakes, as well as stunning
                  custom celebration cakes for life&apos;s special moments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">
              What We Stand For
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Our values guide everything we do, from ingredient selection to
              customer service.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Made with Love
              </h3>
              <p className="text-neutral-600">
                Every item is baked with genuine care and passion. We treat each
                order as if we&apos;re making it for our own family.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Quality First
              </h3>
              <p className="text-neutral-600">
                We never compromise on ingredients. From real butter to premium
                chocolate, quality is non-negotiable.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-2">
                Community Focus
              </h3>
              <p className="text-neutral-600">
                We&apos;re proud to serve our local Philadelphia community and
                build lasting relationships with our customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area Section */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-neutral-800 mb-6">
                Serving the Philadelphia Area
              </h2>
              <div className="space-y-4 text-neutral-600">
                <p>
                  We&apos;re located in Northeast Philadelphia and proudly serve
                  the broader Philadelphia area. Our current service model is
                  pickup-only, allowing us to maintain the highest quality and
                  freshness of our products.
                </p>
                <p>
                  All pickups take place on Fridays between 10 AM and 6 PM at
                  our home bakery location. When you place an order, you&apos;ll
                  select a convenient 2-hour pickup window that works for your
                  schedule.
                </p>
                <p>
                  We&apos;re working on expanding our services in the future,
                  including potential delivery options. Stay tuned for updates!
                </p>
              </div>
              <div className="mt-6">
                <Link href="/pickup">
                  <Button variant="outline">
                    View Pickup Information
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-pink-100 flex items-center justify-center">
              <Sparkles className="w-24 h-24 text-pink-300" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-pink-600">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Try Our Treats?
            </h2>
            <p className="text-pink-100 mb-8">
              Browse our weekly menu or get in touch for a custom cake inquiry.
              We can&apos;t wait to bake something special for you!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/menu">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-pink-600 hover:bg-pink-50"
                >
                  View Weekly Menu
                </Button>
              </Link>
              <Link href="/custom-cakes">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  Custom Cake Inquiry
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
