/**
 * Auth Module
 *
 * Centralized authentication and authorization utilities.
 * Replaces duplicated verifyAdmin functions across API routes.
 */

import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';

// Re-export utilities
export * from './utils';

/**
 * Result of a successful authentication check.
 */
export interface AuthResult {
  user: User;
  supabase: SupabaseClient;
}

/**
 * Result of a failed authentication check.
 */
export interface AuthError {
  error: string;
  status: number;
}

/**
 * Type guard to check if result is an auth error.
 */
export function isAuthError(result: AuthResult | AuthError): result is AuthError {
  return 'error' in result && 'status' in result;
}

/**
 * Verify that the request has a valid authenticated user.
 *
 * @returns AuthResult with user and supabase client, or AuthError
 *
 * @example
 * const auth = await verifyAuth();
 * if (isAuthError(auth)) {
 *   return NextResponse.json({ error: auth.error }, { status: auth.status });
 * }
 * // Use auth.user and auth.supabase
 */
export async function verifyAuth(): Promise<AuthResult | AuthError> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: 'Unauthorized', status: 401 };
  }

  return { user, supabase };
}

/**
 * Verify that the request has a valid authenticated admin user.
 *
 * Checks:
 * 1. User is authenticated
 * 2. User has is_admin=true in their profile
 *
 * @returns AuthResult with user and supabase client, or AuthError
 *
 * @example
 * export async function GET() {
 *   const auth = await verifyAdmin();
 *   if (isAuthError(auth)) {
 *     return NextResponse.json({ error: auth.error }, { status: auth.status });
 *   }
 *   // User is authenticated and is an admin
 *   const { user, supabase } = auth;
 * }
 */
export async function verifyAdmin(): Promise<AuthResult | AuthError> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: 'Unauthorized', status: 401 };
  }

  // Check admin status in profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: 'Forbidden', status: 403 };
  }

  return { user, supabase };
}

/**
 * Get the current user's profile.
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @returns User profile or null
 */
export async function getUserProfile(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return profile;
}
