/**
 * Shared Admin Verification Utility
 *
 * Single Responsibility: Admin authentication/authorization only
 * Used by all admin API routes to ensure consistent verification
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export interface AdminAuthResult {
  user: { id: string; email?: string };
  supabase: SupabaseClient;
}

export interface AdminAuthError {
  error: string;
  status: 401 | 403;
}

export type AdminVerificationResult = AdminAuthResult | AdminAuthError;

/**
 * Verify the current user is an admin
 * Returns either the authenticated admin user or an error
 */
export async function verifyAdmin(): Promise<AdminVerificationResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Failed to fetch profile:', profileError);
    return { error: 'Unauthorized', status: 401 };
  }

  if (!profile?.is_admin) {
    return { error: 'Forbidden', status: 403 };
  }

  return { user, supabase };
}

/**
 * Check if a verification result is an error
 */
export function isAdminAuthError(result: AdminVerificationResult): result is AdminAuthError {
  return 'error' in result;
}

/**
 * Helper to check admin status without throwing
 * Useful for conditional rendering in server components
 */
export async function isAdmin(): Promise<boolean> {
  const result = await verifyAdmin();
  return !isAdminAuthError(result);
}
