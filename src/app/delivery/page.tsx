import { Metadata } from 'next';
import Link from 'next/link';
import { Truck, Clock, MapPin, DollarSign, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { FREE_DELIVERY_MINIMUM, DELIVERY_FEE, DELIVERY_RADIUS_MILES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Delivery Information',
  description: 'Learn about our delivery service. Free delivery on orders $50+ within 20 miles of Northeast Philadelphia.',
};

export default function DeliveryPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-pink-50 to-white py-16 lg:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Truck className="w-10 h-10 text-pink-600" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-6">
              Delivery Information
            </h1>
            <p className="text-xl text-neutral-600 leading-relaxed">
              We deliver fresh baked goods right to your door in the greater Philadelphia area.
              Free delivery on orders over {formatCurrency(FREE_DELIVERY_MINIMUM)}!
            </p>
          </div>
        </div>
      </section>

      {/* Key Info Cards */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Service Area */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 text-center">
              <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">Service Area</h3>
              <p className="text-neutral-600">
                Within {DELIVERY_RADIUS_MILES} miles of Northeast Philadelphia (ZIP 19136)
              </p>
            </div>

            {/* Delivery Days */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 text-center">
              <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">Delivery Days</h3>
              <p className="text-neutral-600">
                Friday &amp; Saturday<br />
                10:00 AM - 6:00 PM
              </p>
            </div>

            {/* Time Windows */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 text-center">
              <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">Time Windows</h3>
              <p className="text-neutral-600">
                Choose a 2-hour delivery window that works for you
              </p>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 text-center">
              <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-800 mb-3">Delivery Fee</h3>
              <p className="text-neutral-600">
                <strong className="text-green-600">Free</strong> on orders {formatCurrency(FREE_DELIVERY_MINIMUM)}+
                <br />
                <span className="text-sm">{formatCurrency(DELIVERY_FEE)} for smaller orders</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-16 text-center">
            How Delivery Works
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-pink-200 -z-10" />

              <div className="text-center">
                <div className="w-24 h-24 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 text-3xl font-bold shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Order by Wednesday</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Browse our weekly menu and place your order by Wednesday 11:59 PM
                </p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 text-3xl font-bold shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">Choose Your Window</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Select Friday or Saturday delivery and pick your preferred 2-hour window
                </p>
              </div>

              <div className="text-center">
                <div className="w-24 h-24 bg-pink-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 text-3xl font-bold shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold text-neutral-800 mb-4">We Deliver Fresh</h3>
                <p className="text-neutral-600 leading-relaxed">
                  Your treats are baked fresh and delivered right to your door
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area Detail */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-12 text-center">
              Areas We Serve
            </h2>

            <div className="bg-pink-50 rounded-3xl p-10 lg:p-14">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4">Philadelphia</h3>
                  <ul className="space-y-2 text-neutral-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Northeast Philadelphia
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Center City
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      North Philadelphia
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      South Philadelphia
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      West Philadelphia
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800 mb-4">Surrounding Areas</h3>
                  <ul className="space-y-2 text-neutral-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Bucks County (nearby)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Montgomery County (nearby)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Delaware County (nearby)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Camden County, NJ
                    </li>
                  </ul>
                </div>
              </div>

              <p className="mt-8 text-sm text-neutral-500 text-center">
                Not sure if we deliver to you? Enter your ZIP code at checkout to check availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-12 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
                <h3 className="font-semibold text-neutral-800 mb-3">
                  What if I&apos;m not home during my delivery window?
                </h3>
                <p className="text-neutral-600">
                  Please ensure someone is available to receive the delivery. We&apos;ll contact you when we&apos;re on the way.
                  If no one is available, we may leave the package at your door if you&apos;ve provided permission in your order notes.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
                <h3 className="font-semibold text-neutral-800 mb-3">
                  Can I change my delivery date or address after ordering?
                </h3>
                <p className="text-neutral-600">
                  Please contact us as soon as possible if you need to make changes. Changes are subject to availability
                  and must be requested before our Wednesday ordering cutoff.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
                <h3 className="font-semibold text-neutral-800 mb-3">
                  Do you deliver custom cakes?
                </h3>
                <p className="text-neutral-600">
                  Yes! Custom cake deliveries are scheduled separately when you submit your inquiry.
                  We offer flexible delivery dates for custom orders.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100">
                <h3 className="font-semibold text-neutral-800 mb-3">
                  What areas are outside your delivery zone?
                </h3>
                <p className="text-neutral-600">
                  We currently deliver within approximately 20 miles of Northeast Philadelphia.
                  If your ZIP code is not in our service area, you&apos;ll see a message at checkout.
                  We&apos;re always expanding - check back soon!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-6">
              Ready to Order?
            </h2>
            <p className="text-xl text-neutral-600 mb-10">
              Check out this week&apos;s menu and place your order for delivery!
            </p>
            <Link href="/menu">
              <Button size="lg" className="shadow-lg shadow-pink-200">
                View This Week&apos;s Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
