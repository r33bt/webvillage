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
        },
      },
    },
  },
  plugins: [],
}

export default config
