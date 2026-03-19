/**
 * Simplified tier definitions for feature gating.
 */

export interface Tier {
  id: string
  level: number
  label: string
}

export const TIERS: Tier[] = [
  { id: 'free', level: 0, label: 'Free' },
  { id: 'starter', level: 1, label: 'Starter' },
  { id: 'pro', level: 2, label: 'Pro' },
  { id: 'directory', level: 3, label: 'Directory' },
  { id: 'directory_pro', level: 4, label: 'Directory Pro' },
  { id: 'enterprise', level: 5, label: 'Enterprise' },
]
