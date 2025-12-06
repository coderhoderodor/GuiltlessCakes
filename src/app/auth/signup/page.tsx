'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Check, Cake } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';
import { validatePhoneNumber } from '@/lib/utils';
import { validatePassword } from '@/lib/validation/password';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.errors[0]);
      return;
    }

    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);

    try {
      await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-pink-100/50 p-8 sm:p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-neutral-800 mb-3">
            Account Created!
          </h2>
          <p className="text-neutral-500 mb-8 leading-relaxed">
            Please check your email to verify your account. Once verified, you can sign in and start ordering.
          </p>
          <Link href="/auth/login">
            <Button>Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-pink-100/50 overflow-hidden">
          {/* Header */}
          <div className="pt-6 pb-4 px-6 sm:px-8 text-center">
            <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Cake className="w-7 h-7 text-pink-600" />
            </div>
            <h1 className="text-2xl font-semibold text-neutral-800 mb-2">
              Create Account
            </h1>
            <p className="text-neutral-500 text-sm">
              Join us to order delicious treats
            </p>
          </div>

          {/* Form */}
          <div className="px-6 sm:px-8 pb-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  name="firstName"
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                <Input
                  type="text"
                  name="lastName"
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <Input
                type="email"
                name="email"
                label="Email Address"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />

              <Input
                type="tel"
                name="phone"
                label="Phone Number"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
                helperText="Optional - used for pickup coordination"
              />

              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
                minLength={8}
              />

              <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                required
              />

              <p className="text-xs text-neutral-500 leading-relaxed pt-2">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-pink-600 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-pink-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              <div className="pt-3">
                <Button type="submit" fullWidth isLoading={isLoading}>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>

            {/* Sign In Link */}
            <p className="mt-8 text-center text-sm text-neutral-500">
              Already have an account?{' '}
              <Link
                href={`/auth/login${redirectTo !== '/' ? `?redirectTo=${redirectTo}` : ''}`}
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
