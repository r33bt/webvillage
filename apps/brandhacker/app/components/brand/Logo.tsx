type Props = {
  size?: number
  className?: string
}

export function Logo({ size = 32, className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="BrandHacker"
      role="img"
    >
      <rect width="32" height="32" rx="6" fill="#09090b" />
      <text
        x="16"
        y="22"
        textAnchor="middle"
        fontSize="20"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        fill="#fafafa"
      >
        B
      </text>
    </svg>
  )
}
