import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-inter)', 'ui-monospace', 'monospace'],
      },
      screens: {
        xs: '480px',
      },
      colors: {
        // Logbook brand — deep automotive orange
        brand: {
          DEFAULT: '#D4520A',
          50:  '#FFF4EE',
          100: '#FFE5D0',
          200: '#FFC49A',
          300: '#FF9B5C',
          400: '#FF7126',
          500: '#F55208',
          600: '#D4520A', // ← primary
          700: '#A83D06',
          800: '#832F07',
          900: '#5C2008',
          950: '#330F02',
        },
        // UI neutrals (same scale X / Bluesky use)
        ink: {
          DEFAULT: '#0F0F0F',
          subtle:  '#536471',
          muted:   '#8B98A5',
          faint:   '#CFD9DE',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          raised:  '#F7F9F9',
          overlay: '#F7F9F9',
        },
        // UK plate colours (authentic)
        plate: {
          yellow: '#F5C518',
          border: '#1A1A1A',
        },
      },
      fontSize: {
        // Tighter scale matching X density
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        modal: '0 8px 32px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in':   'fadeIn 0.15s ease-out',
        'slide-up':  'slideUp 0.2s ease-out',
        'spin-slow': 'spin 1.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
