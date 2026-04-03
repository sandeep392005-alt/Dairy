'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { syncAuthenticatedCustomer } from '../../lib/api';
import { getSupabaseClient } from '../../lib/supabaseClient';

const SupabaseAuthContext = createContext(null);

export function SupabaseAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastSyncedTokenRef = useRef('');

  const syncCustomerRecord = async (nextSession) => {
    const accessToken = nextSession?.access_token;

    if (!accessToken || lastSyncedTokenRef.current === accessToken) {
      return;
    }

    await syncAuthenticatedCustomer(accessToken);
    lastSyncedTokenRef.current = accessToken;
  };

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session ?? null);
        setLoading(false);
        if (data.session) {
          syncCustomerRecord(data.session).catch((error) => {
            console.warn('Failed to sync customer record after session load.', error);
          });
        }
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setLoading(false);

      if (nextSession) {
        syncCustomerRecord(nextSession).catch((error) => {
          console.warn('Failed to sync customer record after auth state change.', error);
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_* env vars.');
    }

    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) {
      throw error;
    }
  };

  const signInWithEmailPassword = async (email, password) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_* env vars.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.session) {
      await syncCustomerRecord(data.session);
    }

    return data;
  };

  const signUpWithEmailPassword = async (email, password) => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_* env vars.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: email.split('@')[0],
        },
      },
    });

    if (error) {
      throw error;
    }

    if (data.session) {
      await syncCustomerRecord(data.session);
    }

    return data;
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signInWithGoogle,
      signInWithEmailPassword,
      signUpWithEmailPassword,
      signOut,
    }),
    [session, loading]
  );

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  }
  return context;
}
