/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#060608',
          900: '#0c0c10',
          850: '#121217',
          800: '#181820',
          750: '#1f1f2a',
          700: '#282834',
          600: '#383848',
          500: '#56566c',
          400: '#8b8ba0',
          300: '#b4b4c4',
          200: '#dedee6',
          100: '#f1f1f5',
          50: '#fafafd',
        },
        vermilion: {
          DEFAULT: '#dc2626',
          hover: '#ef4444',
          muted: 'rgba(220, 38, 38, 0.15)',
          border: 'rgba(220, 38, 38, 0.35)',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Shippori Mincho"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.25em',
        widest3: '0.35em',
      },
      backgroundImage: {
        'noise-pattern': "radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 0)",
        'vignette': "radial-gradient(circle at center, transparent 30%, rgba(6, 6, 8, 0.85) 100%)",
        'ink-wash': "linear-gradient(180deg, rgba(6,6,8,0) 0%, rgba(6,6,8,0.7) 60%, rgba(6,6,8,1) 100%)",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
