import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#08090c',
          900: '#0d0f14',
          850: '#12141b',
          800: '#171a23',
          700: '#232733',
          600: '#333846',
          500: '#4a5062',
          400: '#6b7285',
          300: '#9aa1b3',
          200: '#c4c9d6',
          100: '#e6e9f0',
        },
        health: {
          on_track: '#3fbf7f',
          at_risk: '#e0a32e',
          stalled: '#d4713a',
          blocked: '#e05252',
          unknown: '#6b7285',
        },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
