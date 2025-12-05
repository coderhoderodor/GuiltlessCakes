/**
 * Environment Variable Validation
 *
 * Validates all required environment variables at startup.
 * Fails fast with clear error messages if configuration is invalid.
 */

import { z } from 'zod';

/**
 * Schema for all environment variables used in the application.
 * Server-only variables should NOT start with NEXT_PUBLIC_.
 */
const envSchema = z.object({
  // Supabase - Required
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // Stripe - Required for payments
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_', 'STRIPE_PUBLISHABLE_KEY must start with pk_'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, 'STRIPE_WEBHOOK_SECRET is required for webhook verification'),

  // Resend - Required for emails
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required for sending emails'),

  // App Configuration - Required
  NEXT_PUBLIC_APP_URL: z.string().url('APP_URL must be a valid URL'),

  // Optional with defaults
  RESEND_FROM_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_BUSINESS_NAME: z.string().optional(),
  NEXT_PUBLIC_BUSINESS_EMAIL: z.string().email().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables.
 * Throws detailed error on failure.
 */
function validateEnv(): Env {
  // Only validate on server side
  if (typeof window !== 'undefined') {
    // Client-side: return a partial object with only public vars
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
      NEXT_PUBLIC_BUSINESS_NAME: process.env.NEXT_PUBLIC_BUSINESS_NAME,
      NEXT_PUBLIC_BUSINESS_EMAIL: process.env.NEXT_PUBLIC_BUSINESS_EMAIL,
    } as Env;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('\n========================================');
    console.error('  ENVIRONMENT VALIDATION FAILED');
    console.error('========================================\n');

    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      console.error(`  ${path}: ${issue.message}`);
    });

    console.error('\n  Check your .env.local file against .env.example\n');
    console.error('========================================\n');

    throw new Error('Invalid environment configuration. See console for details.');
  }

  return result.data;
}

/**
 * Validated environment variables.
 * Access via: import { env } from '@/lib/env';
 */
export const env = validateEnv();

/**
 * Helper to get optional env vars with defaults.
 */
export const config = {
  resendFromEmail: env.RESEND_FROM_EMAIL || 'noreply@guiltlesscakes.com',
  businessName: env.NEXT_PUBLIC_BUSINESS_NAME || 'Guiltless Cakes',
  businessEmail: env.NEXT_PUBLIC_BUSINESS_EMAIL || 'hello@guiltlesscakes.com',
};
