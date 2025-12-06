import { createBrowserClient } from '@supabase/ssr';

// Create a new client for each call - let Supabase SSR handle caching internally
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
