'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Create client once per component instance
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let isMounted = true;

    // Helper to fetch profile with timeout
    const fetchProfileWithTimeout = async (userId: string, timeoutMs = 5000) => {
      try {
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), timeoutMs);
        });

        const fetchPromise = supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
          .then(({ data }) => data);

        return await Promise.race([fetchPromise, timeoutPromise]);
      } catch (err) {
        console.warn('[useAuth] Profile fetch failed or timed out:', err);
        return null;
      }
    };

    // Safety timeout - always set loading false after 8 seconds max
    const safetyTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('[useAuth] Safety timeout reached, forcing loading=false');
        setLoading(false);
      }
    }, 8000);

    // Get initial session - use getSession() which is faster (reads from storage first)
    const getInitialSession = async () => {
      console.log('[useAuth] Getting initial session...');
      try {
        // getSession() is faster than getUser() - it reads from local storage first
        const { data: { session }, error } = await supabase.auth.getSession();

        console.log('[useAuth] Session result:', { userId: session?.user?.id, error: error?.message });

        if (!isMounted) return;

        if (error) {
          console.log('[useAuth] Setting loading false (error)');
          setLoading(false);
          return;
        }

        const user = session?.user ?? null;
        setUser(user);

        if (user) {
          const profile = await fetchProfileWithTimeout(user.id);
          if (isMounted) {
            setProfile(profile);
          }
        }

        console.log('[useAuth] Setting loading false (success)');
        setLoading(false);
      } catch (error) {
        console.error('[useAuth] Caught error:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      console.log('[useAuth] Auth state changed:', event, { userId: session?.user?.id });

      setUser(session?.user ?? null);
      // Set loading false IMMEDIATELY - don't wait for profile
      setLoading(false);

      if (session?.user) {
        // Fetch profile in background - don't block
        fetchProfileWithTimeout(session.user.id).then(profile => {
          if (isMounted) {
            setProfile(profile);
          }
        });
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Sign in timed out. Please try again.')), 15000);
    });

    const signInPromise = supabase.auth.signInWithPassword({
      email,
      password,
    });

    const { data, error } = await Promise.race([signInPromise, timeoutPromise]);

    if (error) {
      throw error;
    }

    return data;
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: { first_name: string; last_name: string; phone: string }
  ) => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Sign up timed out. Please try again.')), 15000);
    });

    const signUpPromise = supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    const { data, error } = await Promise.race([signUpPromise, timeoutPromise]);

    if (error) {
      throw error;
    }

    return data;
  };

  const signInWithMagicLink = async (email: string) => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out. Please try again.')), 15000);
    });

    const otpPromise = supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    const { data, error } = await Promise.race([otpPromise, timeoutPromise]);

    if (error) {
      throw error;
    }

    return data;
  };

  const signOut = async () => {
    const timeoutPromise = new Promise<{ error: Error | null }>((resolve) => {
      setTimeout(() => resolve({ error: new Error('Sign out timed out') }), 10000);
    });

    const signOutPromise = supabase.auth.signOut();
    const { error } = await Promise.race([signOutPromise, timeoutPromise]);

    if (error) {
      console.error('Sign out error:', error.message);
      // Don't throw - always proceed even if server call failed
    }
  };

  const resetPassword = async (email: string) => {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timed out. Please try again.')), 15000);
    });

    const resetPromise = supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    const { data, error } = await Promise.race([resetPromise, timeoutPromise]);

    if (error) {
      throw error;
    }

    return data;
  };

  const updatePassword = async (newPassword: string) => {
    // Add timeout to prevent hanging (30 seconds - Supabase can be slow)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Password update timed out. Please try again.')), 30000);
    });

    const updatePromise = supabase.auth.updateUser({
      password: newPassword,
    });

    const { data, error } = await Promise.race([updatePromise, timeoutPromise]) as Awaited<typeof updatePromise>;

    if (error) {
      throw error;
    }

    return data;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    setProfile(data);
    return data;
  };

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.is_admin ?? false,
    signIn,
    signUp,
    signInWithMagicLink,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  };
}
