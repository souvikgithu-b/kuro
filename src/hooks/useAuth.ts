import { useState, useEffect } from 'react';
import type { AdminUser } from '../lib/auth';
import { getCurrentAdmin, signInAdmin, signOutAdmin } from '../lib/auth';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useAuth() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const user = await getCurrentAdmin();
        if (mounted) {
          setAdmin(user);
        }
      } catch (err) {
        console.error('Failed checking auth state:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Supabase auth change listener
    let authListener: { subscription?: { unsubscribe: () => void } } | null = null;
    if (isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setAdmin({
            id: session.user.id,
            email: session.user.email || 'admin@kuro.cinema',
            role: 'admin',
            name: session.user.user_metadata?.name || 'Administrator',
          });
        } else if (event === 'SIGNED_OUT') {
          setAdmin(null);
        }
      });
      authListener = data;
    }

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const user = await signInAdmin(email, pass);
      setAdmin(user);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOutAdmin();
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    admin,
    isAuthenticated: Boolean(admin),
    loading,
    login,
    logout,
  };
}
