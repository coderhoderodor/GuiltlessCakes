import { createClient } from '@/lib/supabase/server';
import ResetPasswordClient from './ResetPasswordClient';

export default async function ResetPasswordPage() {
  // Check session server-side using the same cookies the callback set
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  console.log('[ResetPassword Server] Session check:', {
    hasSession: !!session,
    userId: session?.user?.id
  });

  // Pass session validity to client
  return <ResetPasswordClient hasValidSession={!!session} />;
}
