import { supabase, isSupabaseConfigured } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  name?: string;
}

const LOCAL_ADMIN_KEY = 'kuro_admin_session';

/**
 * Get current authenticated admin user (either from Supabase session or local demo session).
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  if (!isSupabaseConfigured()) {
    const local = localStorage.getItem(LOCAL_ADMIN_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        localStorage.removeItem(LOCAL_ADMIN_KEY);
      }
    }
    return null;
  }

  // Demo sessions must never authenticate users against a configured backend.
  localStorage.removeItem(LOCAL_ADMIN_KEY);

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session || !session.user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, display_name')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError || profile?.role !== 'admin') {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email || 'admin@kuro.cinema',
      role: 'admin',
      name: profile.display_name || session.user.user_metadata?.name || 'Administrator',
    };
  } catch (err) {
    console.error('Error fetching admin session:', err);
    return null;
  }
}

/**
 * Sign in admin using email and password.
 */
export async function signInAdmin(email: string, password: string): Promise<AdminUser> {
  const cleanEmail = email.trim().toLowerCase();

  // Local demo authentication is available only without a configured backend.
  if (!isSupabaseConfigured()) {
    if (password.length < 4) {
      throw new Error('Password must be at least 4 characters.');
    }

    const demoUser: AdminUser = {
      id: 'admin-kuro-root',
      email: cleanEmail,
      role: 'admin',
      name: 'Kuro Administrator',
    };
    localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(demoUser));
    return demoUser;
  }

  // Real Supabase Auth login
  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error || !data.user) {
    throw new Error(error?.message || 'Authentication failed. Please verify your credentials.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== 'admin') {
    await supabase.auth.signOut();
    throw new Error('This account is not authorized to access the admin console.');
  }

  const user: AdminUser = {
    id: data.user.id,
    email: data.user.email || cleanEmail,
    role: 'admin',
    name: profile.display_name || data.user.user_metadata?.name || 'Administrator',
  };

  localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(user));
  return user;
}

/**
 * Sign out admin user.
 */
export async function signOutAdmin(): Promise<void> {
  localStorage.removeItem(LOCAL_ADMIN_KEY);
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore network errors on logout
    }
  }
}
