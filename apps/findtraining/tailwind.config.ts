import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/engine/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0F6FEC',
          teal: '#00C48C',
          dark: '#0A0F1E',
          'blue-light': '#EBF3FE',
          'teal-light': '#E0FBF4',
          // Visual kit (docs/VISUAL-KIT.md): shades already in docs/brand-guidelines.md
          'blue-dark': '#0A52B8',
          'teal-dark': '#00916A',
          ink: '#0F172A',
          mist: '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
