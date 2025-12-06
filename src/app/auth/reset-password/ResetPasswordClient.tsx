'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, AlertCircle } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { updatePasswordAction } from './actions';

type PageState = 'ready' | 'expired' | 'updating' | 'success';

interface Props {
  hasValidSession: boolean;
}

export default function ResetPasswordClient({ hasValidSession }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pageState, setPageState] = useState<PageState>(hasValidSession ? 'ready' : 'expired');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setPageState('updating');

    try {
      // Use server action to update password (server has access to session cookies)
      const result = await updatePasswordAction(password);

      if (!result.success) {
        const msg = result.error?.toLowerCase() || '';
        if (msg.includes('expired') || msg.includes('session')) {
          setError('Your reset link has expired. Please request a new one.');
        } else {
          setError(result.error || 'Failed to update password');
        }
        setPageState('ready');
        return;
      }

      setPageState('success');

      // Redirect after showing success
      setTimeout(() => {
        router.push('/auth/login');
      }, 2500);
    } catch (err) {
      console.error('[ResetPassword] Caught error:', err);
      setError('Failed to update password. Please try again.');
      setPageState('ready');
    }
  };

  // Expired/invalid session
  if (pageState === 'expired') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <Card variant="elevated" className="w-full max-w-md text-center">
          <CardContent>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">
              Link Expired
            </h2>
            <p className="text-neutral-600 leading-loose mb-8">
              This password reset link has expired or is invalid. Please request a new one.
            </p>
            <div className="flex flex-col gap-4">
              <Link href="/auth/forgot-password">
                <Button fullWidth>Request New Link</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" fullWidth>Back to Sign In</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (pageState === 'success') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <Card variant="elevated" className="w-full max-w-md text-center">
          <CardContent>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">
              Password Updated!
            </h2>
            <p className="text-neutral-600 leading-loose">
              Your password has been successfully updated. Redirecting to sign in...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ready state - show form
  const isUpdating = pageState === 'updating';

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <Card variant="elevated" className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Reset Password</CardTitle>
          <p className="text-center text-neutral-500 mt-6">
            Enter your new password below
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                {error}
                {error.includes('expired') && (
                  <Link href="/auth/forgot-password" className="block mt-2 text-pink-600 hover:underline">
                    Request a new reset link
                  </Link>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-14">
            <Input
              type="password"
              label="New Password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={isUpdating}
            />

            <Input
              type="password"
              label="Confirm New Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isUpdating}
            />

            <p className="text-xs text-neutral-500 leading-relaxed pt-2">
              Password must be at least 8 characters long.
            </p>

            <div className="pt-4">
              <Button type="submit" fullWidth isLoading={isUpdating}>
                {isUpdating ? 'Updating Password...' : 'Update Password'}
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <Link href="/auth/login" className="text-sm text-neutral-500 hover:text-pink-600 transition-colors">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
