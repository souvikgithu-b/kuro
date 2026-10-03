export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => (
  supabaseUrl.length > 0 &&
  !supabaseUrl.includes('your-project.supabase.co') &&
  supabaseAnonKey.length > 20 &&
  !supabaseAnonKey.includes('your-anon-key')
);
