import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const hasSupabaseConfig = Boolean(
    env.VITE_SUPABASE_URL &&
      !env.VITE_SUPABASE_URL.includes('https://kucsegvznbdbeigklgzv.supabase.co') &&
      env.VITE_SUPABASE_ANON_KEY &&
      !env.VITE_SUPABASE_ANON_KEY.includes('sb_publishable_nLEdD0xACBvHfZFAAdm4sA_eiyCuhmb')
  )

  if (mode === 'production' && !hasSupabaseConfig) {
    throw new Error('Production builds require VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  return {
    plugins: [react()],
  }
})
