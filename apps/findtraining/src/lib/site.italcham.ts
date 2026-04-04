// ItalCham Malaysia — Branded Demo Config
// Usage: temporarily replace the contents of site.ts with this file for mockup screenshots.
// Revert with: git checkout apps/findtraining/src/lib/site.ts
//
// Colours: Italian flag (green #009246, white #FFFFFF, red #CE2B37)
// Companion files that also need updating for the demo — see ITALCHAM-MOCKUP-INSTRUCTIONS.md

export const SITE_ID = 'italcham' as const

export const siteConfig = {
  id: SITE_ID,
  name: 'ItalCham Malaysia — Member Directory',
  description: 'The official member directory of the Italian-Malaysian Chamber of Commerce',
  url: 'https://italcham.my',
  brand: {
    blue: '#009246',   // Italian green (primary)
    teal: '#CE2B37',   // Italian red (accent)
    dark: '#1A1A1A',   // Near-black (unchanged — works with both flag colours)
  },
} as const
