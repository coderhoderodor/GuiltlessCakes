import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sanitizeRedirectPath } from '@/lib/auth/utils';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeRedirectPath(searchParams.get('next'));

  console.log('[Auth Callback] Starting...', { code: code?.slice(0, 10) + '...', next });

  if (code) {
    try {
      console.log('[Auth Callback] Creating Supabase client...');
      const supabase = await createClient();

      console.log('[Auth Callback] Exchanging code for session...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      console.log('[Auth Callback] Exchange result:', {
        hasSession: !!data?.session,
        error: error?.message
      });

      if (!error) {
        const redirectUrl = `${origin}${next}`;
        console.log('[Auth Callback] Redirecting to:', redirectUrl);
        return NextResponse.redirect(redirectUrl);
      }

      console.error('[Auth Callback] Error:', error.message);
    } catch (err) {
      console.error('[Auth Callback] Exception:', err);
    }
  } else {
    console.log('[Auth Callback] No code provided');
  }

  // Return the user to an error page with some instructions
  console.log('[Auth Callback] Redirecting to error page');
  return NextResponse.redirect(`${origin}/auth/auth-error`);
}
