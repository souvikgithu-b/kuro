import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const loadedEnv = loadEnv(mode, process.cwd(), '')
  const env = { ...process.env, ...loadedEnv }

  const hasSupabaseConfig = Boolean(
    env.VITE_SUPABASE_URL &&
    !env.VITE_SUPABASE_URL.includes('your-project') &&
    env.VITE_SUPABASE_ANON_KEY &&
    !env.VITE_SUPABASE_ANON_KEY.includes('your-supabase')
  )

  if (mode === 'production' && !hasSupabaseConfig) {
    throw new Error('Production builds require VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }

  return {
    plugins: [react()],
  }
})
