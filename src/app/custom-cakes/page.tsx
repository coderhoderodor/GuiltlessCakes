'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Users,
  Layers,
  Palette,
  Upload,
  X,
  Check,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardContent,
} from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import {
  EVENT_TYPES,
  CAKE_SHAPES,
  DECORATION_STYLES,
  TIER_OPTIONS,
  DIETARY_TAGS,
  MAX_INQUIRY_IMAGES,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from '@/lib/constants';
import type { InquiryFormData } from '@/types';

export default function CustomCakesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);

  const [formData, setFormData] = useState<InquiryFormData>({
    event_type: 'birthday',
    event_date: '',
    servings: 20,
    tiers: 1,
    shape: 'round',
    style: 'buttercream',
    color_palette_text: '',
    dietary_notes: '',
    notes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'servings' || name === 'tiers' ? Number(value) : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate files
    const validFiles = files.filter((file) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError('Only JPG, PNG, and WebP images are allowed');
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setError('Each image must be under 5MB');
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > MAX_INQUIRY_IMAGES) {
      setError(`Maximum ${MAX_INQUIRY_IMAGES} images allowed`);
      return;
    }

    setError('');
    setImages((prev) => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      router.push('/auth/login?redirectTo=/custom-cakes');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      // Create the inquiry
      const { data: inquiry, error: inquiryError } = await supabase
        .from('inquiries')
        .insert({
          user_id: user.id,
          event_type: formData.event_type,
          event_date: formData.event_date,
          servings: formData.servings,
          tiers: formData.tiers,
          shape: formData.shape,
          style: formData.style,
          color_palette_text: formData.color_palette_text || null,
          dietary_notes: formData.dietary_notes || null,
          notes: formData.notes || null,
          status: 'new',
        })
        .select()
        .single();

      if (inquiryError) throw inquiryError;

      // Upload images if any
      if (images.length > 0 && inquiry) {
        for (const image of images) {
          const fileExt = image.name.split('.').pop();
          const fileName = `${inquiry.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('inquiry-images')
            .upload(fileName, image);

          if (uploadError) {
            console.error('Image upload error:', uploadError);
            continue;
          }

          // Get public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from('inquiry-images').getPublicUrl(fileName);

          // Save image reference
          await supabase.from('inquiry_images').insert({
            inquiry_id: inquiry.id,
            image_url: publicUrl,
          });
        }
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to submit inquiry'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <Card variant="elevated" className="w-full max-w-md text-center">
          <CardContent>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-800 mb-2">
              Inquiry Submitted!
            </h2>
            <p className="text-neutral-600 mb-6">
              Thank you for your custom cake inquiry! We&apos;ve received your
              request and will review it within 2-3 business days. You&apos;ll
              receive a quote via email.
            </p>
            <div className="space-y-3">
              <Link href="/account/orders">
                <Button fullWidth>View My Inquiries</Button>
              </Link>
              <Link href="/menu">
                <Button variant="outline" fullWidth>
                  Browse Weekly Menu
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-pink-50 to-white py-10 lg:py-14">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
              Custom Cake Inquiry
            </h1>
            <p className="text-base text-neutral-600 leading-relaxed">
              Tell us about your special celebration and we&apos;ll create the
              perfect custom cake.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 lg:py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            {/* Login Notice */}
            {!isAuthenticated && (
              <div className="mb-10 p-5 bg-pink-50 rounded-xl flex items-start gap-4">
                <Info className="w-5 h-5 text-pink-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-neutral-700">
                    You&apos;ll need to{' '}
                    <Link
                      href="/auth/login?redirectTo=/custom-cakes"
                      className="text-pink-600 font-medium hover:underline"
                    >
                      sign in
                    </Link>{' '}
                    or{' '}
                    <Link
                      href="/auth/signup?redirectTo=/custom-cakes"
                      className="text-pink-600 font-medium hover:underline"
                    >
                      create an account
                    </Link>{' '}
                    to submit an inquiry.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-16">
              {/* Step 1: Event Details */}
              <Card variant="outlined">
                <CardContent>
                  <h2 className="text-xl font-semibold text-neutral-800 mb-10 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-pink-600" />
                    Event Details
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-12">
                    <Select
                      label="Event Type"
                      name="event_type"
                      value={formData.event_type}
                      onChange={handleChange}
                      options={EVENT_TYPES.map((t) => ({
                        value: t.value,
                        label: t.label,
                      }))}
                      required
                    />

                    <Input
                      type="date"
                      label="Event Date"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />

                    <Input
                      type="number"
                      label="Number of Servings"
                      name="servings"
                      value={formData.servings}
                      onChange={handleChange}
                      required
                      min={10}
                      max={500}
                      helperText="Approximate number of guests"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Cake Specifications */}
              <Card variant="outlined">
                <CardContent>
                  <h2 className="text-xl font-semibold text-neutral-800 mb-10 flex items-center gap-3">
                    <Layers className="w-5 h-5 text-pink-600" />
                    Cake Specifications
                  </h2>

                  <div className="grid sm:grid-cols-2 gap-12">
                    <Select
                      label="Number of Tiers"
                      name="tiers"
                      value={String(formData.tiers)}
                      onChange={handleChange}
                      options={TIER_OPTIONS.map((t) => ({
                        value: String(t),
                        label: `${t} ${t === 1 ? 'Tier' : 'Tiers'}`,
                      }))}
                      required
                    />

                    <Select
                      label="Cake Shape"
                      name="shape"
                      value={formData.shape}
                      onChange={handleChange}
                      options={CAKE_SHAPES.map((s) => ({
                        value: s.value,
                        label: s.label,
                      }))}
                      required
                    />

                    <Select
                      label="Decoration Style"
                      name="style"
                      value={formData.style}
                      onChange={handleChange}
                      options={DECORATION_STYLES.map((s) => ({
                        value: s.value,
                        label: s.label,
                      }))}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Design Preferences */}
              <Card variant="outlined">
                <CardContent>
                  <h2 className="text-xl font-semibold text-neutral-800 mb-10 flex items-center gap-3">
                    <Palette className="w-5 h-5 text-pink-600" />
                    Design Preferences
                  </h2>

                  <div className="space-y-14">
                    <Input
                      label="Color Palette"
                      name="color_palette_text"
                      value={formData.color_palette_text}
                      onChange={handleChange}
                      placeholder="e.g., Blush pink, gold accents, white"
                      helperText="Describe your preferred colors"
                    />

                    <div>
                      <label className="block text-[11px] font-medium text-neutral-700 mb-5 uppercase tracking-wider">
                        Dietary Requirements
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {DIETARY_TAGS.map((tag) => (
                          <button
                            key={tag.value}
                            type="button"
                            onClick={() => {
                              const current = formData.dietary_notes || '';
                              const tags = current
                                .split(',')
                                .map((t) => t.trim())
                                .filter(Boolean);
                              if (tags.includes(tag.label)) {
                                setFormData((prev) => ({
                                  ...prev,
                                  dietary_notes: tags
                                    .filter((t) => t !== tag.label)
                                    .join(', '),
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  dietary_notes: [...tags, tag.label].join(', '),
                                }));
                              }
                            }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                              formData.dietary_notes?.includes(tag.label)
                                ? 'bg-pink-600 text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            {tag.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Textarea
                      label="Additional Notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any specific requests, themes, inscriptions, or special requirements..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 4: Inspiration Images */}
              <Card variant="outlined">
                <CardContent>
                  <h2 className="text-xl font-semibold text-neutral-800 mb-10 flex items-center gap-3">
                    <Upload className="w-5 h-5 text-pink-600" />
                    Inspiration Images
                  </h2>

                  <div className="space-y-14">
                    <p className="text-sm text-neutral-600">
                      Upload up to {MAX_INQUIRY_IMAGES} images for inspiration
                      (JPG, PNG, or WebP, max 5MB each)
                    </p>

                    {/* Image Preview Grid */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {images.map((image, index) => (
                          <div key={index} className="relative aspect-square">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Inspiration ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Button */}
                    {images.length < MAX_INQUIRY_IMAGES && (
                      <label className="block">
                        <input
                          type="file"
                          accept={ACCEPTED_IMAGE_TYPES.join(',')}
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center cursor-pointer hover:border-pink-400 hover:bg-pink-50/50 transition-colors">
                          <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                          <p className="text-neutral-600">
                            Click to upload images
                          </p>
                          <p className="text-sm text-neutral-400 mt-1">
                            {MAX_INQUIRY_IMAGES - images.length} slots remaining
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Lead Time Notice */}
              <div className="p-4 bg-yellow-50 rounded-xl">
                <p className="text-sm text-yellow-800">
                  <strong>Please note:</strong> Custom cakes require a minimum
                  of one month lead time. Orders with less lead time may incur a
                  rush fee. We&apos;ll discuss timing in our quote.
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isSubmitting}
                disabled={!isAuthenticated}
              >
                {isAuthenticated ? (
                  <>
                    Submit Inquiry
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  'Sign in to Submit'
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
