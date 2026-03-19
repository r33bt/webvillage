/**
 * WebVillage brand design tokens.
 * Single source of truth for colours, typography, and spacing.
 */

export const brand = {
  colors: {
    primary: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',  // primary
      600: '#4f46e5',  // primary dark
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      950: '#1e1b4b',
    },
    purple: {
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
    },
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    white: '#ffffff',
    black: '#0f172a',
  },
  fonts: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Menlo, monospace',
  },
  gradient: {
    hero: 'linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%)',
    subtle: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
} as const

export type BrandColors = typeof brand.colors
