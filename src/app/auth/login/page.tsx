'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Mail, Cake } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const { signIn, signInWithMagicLink } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setIsMagicLinkLoading(true);

    try {
      await signInWithMagicLink(email);
      setMagicLinkSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link');
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-pink-100/50 p-8 sm:p-10 text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-pink-600" />
          </div>
          <h2 className="text-2xl font-semibold text-neutral-800 mb-3">
            Check your email
          </h2>
          <p className="text-neutral-500 mb-8 leading-relaxed">
            We&apos;ve sent a magic link to <span className="font-medium text-neutral-700">{email}</span>. Click the link to sign in to your account.
          </p>
          <Button variant="outline" onClick={() => setMagicLinkSent(false)}>
            Use a different method
          </Button>
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
            <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Cake className="w-5 h-5 text-pink-600" />
            </div>
            <h1 className="text-xl font-semibold text-neutral-800 mb-1">
              Welcome back
            </h1>
            <p className="text-neutral-500 text-sm">
              Sign in to your account to continue
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
              <Input
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-neutral-300 text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-neutral-600">Remember me</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-pink-600 hover:text-pink-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="pt-3">
                <Button type="submit" fullWidth isLoading={isLoading}>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-neutral-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Magic Link Button */}
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={handleMagicLink}
              isLoading={isMagicLinkLoading}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Magic Link
            </Button>

            {/* Sign Up Link */}
            <p className="mt-4 text-center text-sm text-neutral-500">
              Don&apos;t have an account?{' '}
              <Link
                href={`/auth/signup${redirectTo !== '/' ? `?redirectTo=${redirectTo}` : ''}`}
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
