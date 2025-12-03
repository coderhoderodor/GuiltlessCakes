'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Instagram, Facebook, Check } from 'lucide-react';
import { Button, Input, Textarea, Card, CardContent } from '@/components/ui';
import { SOCIAL_LINKS } from '@/lib/constants';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-pink-50 to-white py-32 lg:py-48">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-10">
              Get in Touch
            </h1>
            <p className="text-lg text-neutral-600 leading-loose">
              Have a question or want to learn more? We&apos;d love to hear from
              you. Reach out using any of the methods below.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-32 lg:py-48">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-10">
                Contact Information
              </h2>

              <div className="space-y-10">
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-2">Email</h3>
                    <a
                      href="mailto:hello@guiltlesscakes.com"
                      className="text-pink-600 hover:text-pink-700"
                    >
                      hello@guiltlesscakes.com
                    </a>
                    <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
                      We typically respond within 24-48 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-2">Phone</h3>
                    <a
                      href="tel:+12155550123"
                      className="text-pink-600 hover:text-pink-700"
                    >
                      (215) 555-0123
                    </a>
                    <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
                      For order-related inquiries only
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-2">
                      Location
                    </h3>
                    <p className="text-neutral-600">Northeast Philadelphia, PA</p>
                    <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
                      Exact address provided upon order confirmation
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-14">
                <h3 className="font-semibold text-neutral-800 mb-6">
                  Follow Us
                </h3>
                <div className="flex gap-6">
                  <a
                    href={SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 hover:bg-pink-200 transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a
                    href={SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 hover:bg-pink-200 transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-6 h-6" />
                  </a>
                </div>
              </div>

              {/* Business Hours */}
              <div className="mt-14 p-10 bg-neutral-50 rounded-xl">
                <h3 className="font-semibold text-neutral-800 mb-6">
                  Pickup Hours
                </h3>
                <p className="text-neutral-600 leading-loose">
                  <strong>Fridays Only</strong>
                  <br />
                  10:00 AM - 6:00 PM
                </p>
                <p className="text-sm text-neutral-500 mt-6 leading-loose">
                  Orders must be placed by Wednesday at 11:59 PM for Friday
                  pickup.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <Card variant="elevated">
                <CardContent>
                  <h2 className="text-2xl font-bold text-neutral-800 mb-10">
                    Send Us a Message
                  </h2>

                  {isSubmitted ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-neutral-800 mb-5">
                        Message Sent!
                      </h3>
                      <p className="text-neutral-600 mb-10 leading-loose">
                        Thank you for reaching out. We&apos;ll get back to you as
                        soon as possible.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsSubmitted(false);
                          setFormData({
                            name: '',
                            email: '',
                            subject: '',
                            message: '',
                          });
                        }}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-14">
                      <Input
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                      />

                      <Input
                        type="email"
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                      />

                      <Input
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="What is this about?"
                      />

                      <Textarea
                        label="Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Your message..."
                        rows={5}
                      />

                      <Button type="submit" fullWidth isLoading={isSubmitting}>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              <p className="mt-4 text-sm text-neutral-500 text-center">
                For custom cake inquiries, please use our{' '}
                <a
                  href="/custom-cakes"
                  className="text-pink-600 hover:text-pink-700 underline"
                >
                  custom cake inquiry form
                </a>{' '}
                instead.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
