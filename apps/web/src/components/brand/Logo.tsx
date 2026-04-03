/**
 * WebVillage lettermark logo — "W" with network nodes on Deep Teal.
 * Usage: <Logo className="h-8 w-8" /> or <Logo variant="light" /> on dark backgrounds
 */

interface LogoProps {
  className?: string
  variant?: 'default' | 'light'
}

export function Logo({ className = 'h-8 w-8', variant = 'default' }: LogoProps) {
  const bgColor = variant === 'light' ? '#FFFFFF' : '#0F766E'
  const strokeColor = variant === 'light' ? '#0F766E' : '#FFFFFF'
  const dotColor = '#D97706' // Warm Amber — network nodes

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="WebVillage"
    >
      <rect width="48" height="48" rx="12" fill={bgColor} />
      {/* W lettermark */}
      <path
        d="M10 13L16 35L24 19L32 35L38 13"
        stroke={strokeColor}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Network node dots — amber accent */}
      <circle cx="10" cy="13" r="2.5" fill={dotColor} />
      <circle cx="38" cy="13" r="2.5" fill={dotColor} />
      <circle cx="24" cy="19" r="2.5" fill={dotColor} />
    </svg>
  )
}
