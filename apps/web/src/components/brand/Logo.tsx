/**
 * WebVillage lettermark logo — "W" on indigo-purple gradient.
 * Usage: <Logo className="h-8 w-8" />
 */

interface LogoProps {
  className?: string
}

export function Logo({ className = 'h-8 w-8' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="WebVillage"
    >
      <defs>
        <linearGradient id="wv-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7e22ce" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#wv-gradient)" />
      <path
        d="M12 14L18 34L24 20L30 34L36 14"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
