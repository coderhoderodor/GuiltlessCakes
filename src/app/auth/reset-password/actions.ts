'use server';

import { createClient } from '@/lib/supabase/server';

export async function updatePasswordAction(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[ResetPassword Action] Starting password update...');

    const supabase = await createClient();

    // Verify we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('[ResetPassword Action] Session check:', { hasSession: !!session, error: sessionError?.message });

    if (!session) {
      return { success: false, error: 'Your session has expired. Please request a new reset link.' };
    }

    console.log('[ResetPassword Action] Calling updateUser...');

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      console.error('[ResetPassword Action] Update error:', updateError.message);
      return { success: false, error: updateError.message };
    }

    console.log('[ResetPassword Action] Password updated successfully');
    return { success: true };
  } catch (err) {
    console.error('[ResetPassword Action] Caught error:', err);
    return { success: false, error: 'Failed to update password. Please try again.' };
  }
}
