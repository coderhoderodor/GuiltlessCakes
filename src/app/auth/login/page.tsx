'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

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
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <Card variant="elevated" className="w-full max-w-lg text-center">
          <CardContent>
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-pink-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">
              Check your email
            </h2>
            <p className="text-neutral-600 mb-8 leading-loose">
              We&apos;ve sent a magic link to <strong>{email}</strong>. Click the
              link to sign in to your account.
            </p>
            <Button variant="outline" onClick={() => setMagicLinkSent(false)}>
              Use a different method
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <Card variant="elevated" className="w-full max-w-lg">
        <CardHeader className="bg-pink-100 rounded-t-2xl">
          <CardTitle className="text-center text-xl">Welcome Back</CardTitle>
          <p className="text-center text-neutral-500 mt-6">
            Sign in to your account to continue
          </p>
        </CardHeader>
        <CardContent className="pt-10 space-y-10">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-[600px] border-[20px] border-red-500">
            <div>
              <Input
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded border-neutral-300 text-pink-600 focus:ring-pink-500" />
                <span className="text-neutral-600">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-pink-600 hover:text-pink-700 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <div className="pt-6">
              <Button type="submit" fullWidth isLoading={isLoading}>
                Sign In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-neutral-500">
                Or continue with
              </span>
            </div>
          </div>

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

          <p className="mt-10 text-center text-sm text-neutral-600">
            Don&apos;t have an account?{' '}
            <Link
              href={`/auth/signup${redirectTo !== '/' ? `?redirectTo=${redirectTo}` : ''}`}
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
