'use client'

import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

interface VerificationBadgeProps {
  lastVerifiedAt: string | Date | null
  verifiedBy?: 'editor' | 'owner' | 'community' | null
  className?: string
}

export function VerificationBadge({
  lastVerifiedAt,
  verifiedBy,
  className = ''
}: VerificationBadgeProps) {
  if (!lastVerifiedAt) return null

  const verifiedDate = new Date(lastVerifiedAt)
  const now = new Date()
  const diffMs = now.getTime() - verifiedDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // Color coding based on freshness (keep semantic status colors)
  const getStatus = () => {
    if (diffDays <= 7) {
      return {
        color: 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: CheckCircle,
        label: diffDays === 0 ? 'Verified today' : `Verified ${diffDays}d ago`,
      }
    } else if (diffDays <= 30) {
      return {
        color: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        icon: Clock,
        label: `Verified ${diffDays}d ago`,
      }
    } else {
      return {
        color: 'bg-destructive/10 text-destructive border-destructive/30',
        icon: AlertCircle,
        label: diffDays < 90 ? `${diffDays}d since verified` : 'Needs verification',
      }
    }
  }

  const status = getStatus()
  const Icon = status.icon

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${status.color} ${className}`}
      title={`Last verified: ${verifiedDate.toLocaleDateString()}${verifiedBy ? ` by ${verifiedBy}` : ''}`}
    >
      <Icon className="w-3 h-3" />
      {status.label}
    </span>
  )
}
