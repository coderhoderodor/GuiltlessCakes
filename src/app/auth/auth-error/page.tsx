'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

export default function AuthErrorPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <Card variant="elevated" className="w-full max-w-md text-center">
        <CardContent>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">
            Authentication Error
          </h2>
          <p className="text-neutral-600 leading-loose mb-8">
            Something went wrong during sign in. Your link may have expired or
            is no longer valid.
          </p>
          <div className="flex flex-col gap-4">
            <Link href="/auth/login">
              <Button fullWidth>Try Again</Button>
            </Link>
            <Link href="/auth/forgot-password">
              <Button variant="outline" fullWidth>
                Request New Link
              </Button>
            </Link>
          </div>
          <div className="mt-8">
            <Link
              href="/"
              className="text-sm text-neutral-500 hover:text-pink-600 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
