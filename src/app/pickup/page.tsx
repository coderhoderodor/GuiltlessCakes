import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Clock, Car, Phone, Bell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import { PICKUP_WINDOWS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Pickup Information',
  description:
    'Learn about pickup hours, location, and instructions for collecting your orders from Guiltless Cakes in Northeast Philadelphia.',
};

export default function PickupPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-pink-50 to-white py-16 lg:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-4">
              Pickup Information
            </h1>
            <p className="text-lg text-neutral-600">
              Everything you need to know about picking up your order from our
              Northeast Philadelphia home bakery.
            </p>
          </div>
        </div>
      </section>

      {/* Main Info Section */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Pickup Details */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-pink-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-800">
                    Location
                  </h2>
                </div>
                <div className="pl-13 ml-13">
                  <p className="text-neutral-600 mb-2">
                    Northeast Philadelphia, PA
                  </p>
                  <p className="text-sm text-neutral-500">
                    The exact address will be provided in your order confirmation
                    email. We&apos;re located in a residential area with convenient
                    street parking.
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-pink-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-800">
                    Pickup Hours
                  </h2>
                </div>
                <div className="pl-13 ml-13">
                  <p className="text-neutral-600 mb-2">
                    <strong>Fridays Only:</strong> 10:00 AM - 6:00 PM
                  </p>
                  <p className="text-sm text-neutral-500 mb-4">
                    When you place your order, you&apos;ll choose one of our
                    convenient 2-hour pickup windows:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {PICKUP_WINDOWS.map((window) => (
                      <div
                        key={window.label}
                        className="bg-neutral-50 rounded-lg px-4 py-2 text-sm text-neutral-700"
                      >
                        {window.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 text-pink-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-800">
                    Parking
                  </h2>
                </div>
                <div className="pl-13 ml-13">
                  <p className="text-neutral-600">
                    Free street parking is available directly in front of our
                    location. There&apos;s typically plenty of space available
                    during pickup hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Pickup Instructions */}
            <div>
              <div className="bg-pink-50 rounded-xl p-6 lg:p-8">
                <h2 className="text-xl font-semibold text-neutral-800 mb-6">
                  When You Arrive
                </h2>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-800 mb-1">
                        Park on the Street
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Find a parking spot on the street near our address.
                        There&apos;s usually plenty of availability.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-800 mb-1 flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Ring the Doorbell
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Come to the front door and ring the doorbell. We&apos;ll
                        bring your order right out.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-800 mb-1 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Text if Needed
                      </h3>
                      <p className="text-sm text-neutral-600">
                        If there&apos;s no answer at the door, please text us at
                        the number provided in your confirmation email.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-pink-200">
                  <p className="text-sm text-neutral-600">
                    <strong>Pro tip:</strong> Please arrive within your selected
                    2-hour window. If you&apos;re running late, let us know and
                    we&apos;ll do our best to accommodate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order Timeline */}
      <section className="py-16 lg:py-20 bg-neutral-50">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-neutral-800 mb-8 text-center">
              Weekly Order Timeline
            </h2>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-pink-200 hidden sm:block" />

              <div className="space-y-6">
                <div className="flex gap-4 sm:gap-6">
                  <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold relative z-10">
                    M
                  </div>
                  <div className="flex-1 pb-6">
                    <h3 className="font-semibold text-neutral-800">
                      Monday - Wednesday
                    </h3>
                    <p className="text-neutral-600">
                      Browse the weekly menu and place your order. Menu items
                      refresh each week with new seasonal flavors.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 sm:gap-6">
                  <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold relative z-10">
                    W
                  </div>
                  <div className="flex-1 pb-6">
                    <h3 className="font-semibold text-neutral-800">
                      Wednesday 11:59 PM
                    </h3>
                    <p className="text-neutral-600">
                      <strong>Order cutoff!</strong> All orders must be placed by
                      this time for Friday pickup.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 sm:gap-6">
                  <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold relative z-10">
                    Th
                  </div>
                  <div className="flex-1 pb-6">
                    <h3 className="font-semibold text-neutral-800">Thursday</h3>
                    <p className="text-neutral-600">
                      Baking day! We prepare all orders fresh. You&apos;ll receive
                      a reminder email with pickup details.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 sm:gap-6">
                  <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold relative z-10">
                    F
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-800">Friday</h3>
                    <p className="text-neutral-600">
                      Pickup day! Come during your selected window (10 AM - 6 PM)
                      to collect your fresh treats.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-neutral-800 mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              <details className="bg-white rounded-xl border border-neutral-200 p-4 group">
                <summary className="font-medium text-neutral-800 cursor-pointer list-none flex items-center justify-between">
                  Can I change my pickup window after ordering?
                  <span className="text-pink-600 group-open:rotate-180 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-neutral-600">
                  Yes, you can modify your pickup window up to 24 hours before
                  your scheduled time. Just log into your account and update your
                  order, or contact us directly.
                </p>
              </details>

              <details className="bg-white rounded-xl border border-neutral-200 p-4 group">
                <summary className="font-medium text-neutral-800 cursor-pointer list-none flex items-center justify-between">
                  What if I miss my pickup window?
                  <span className="text-pink-600 group-open:rotate-180 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-neutral-600">
                  Please contact us as soon as possible if you can&apos;t make
                  your window. We&apos;ll do our best to accommodate a later
                  pickup on the same day. Orders not picked up by 6 PM may be
                  forfeited.
                </p>
              </details>

              <details className="bg-white rounded-xl border border-neutral-200 p-4 group">
                <summary className="font-medium text-neutral-800 cursor-pointer list-none flex items-center justify-between">
                  Can someone else pick up my order?
                  <span className="text-pink-600 group-open:rotate-180 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-neutral-600">
                  Yes! Just let us know the name of the person picking up when
                  you place your order or contact us ahead of time. They should
                  provide your order number or name.
                </p>
              </details>

              <details className="bg-white rounded-xl border border-neutral-200 p-4 group">
                <summary className="font-medium text-neutral-800 cursor-pointer list-none flex items-center justify-between">
                  Do you offer delivery?
                  <span className="text-pink-600 group-open:rotate-180 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-neutral-600">
                  Currently, we only offer pickup from our Northeast Philadelphia
                  location. We&apos;re exploring delivery options for the future,
                  so stay tuned!
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-pink-600">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
            <p className="text-pink-100 mb-8">
              Browse this week&apos;s menu and place your order for Friday
              pickup.
            </p>
            <Link href="/menu">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-pink-600 hover:bg-pink-50"
              >
                View This Week&apos;s Menu
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
