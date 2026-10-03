import { createClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseUrl, isSupabaseConfigured } from './supabaseConfig';

export { isSupabaseConfigured } from './supabaseConfig';

const unconfiguredClient = new Proxy(Object.create(null) as ReturnType<typeof createClient>, {
  get() {
    throw new Error('Supabase is not configured.');
  },
});

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : unconfiguredClient;
