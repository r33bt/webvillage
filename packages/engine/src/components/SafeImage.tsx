'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallback?: React.ReactNode
  fallbackClassName?: string
}

/**
 * SafeImage Component
 *
 * A wrapper around Next.js Image that gracefully handles image load failures.
 * When an image fails to load (e.g., 502 from Clearbit), it either:
 * 1. Shows a custom fallback component, or
 * 2. Hides itself completely
 *
 * This prevents React hydration crashes caused by broken external images.
 */
export function SafeImage({
  fallback,
  fallbackClassName,
  className,
  alt,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>
    }
    // If no fallback provided, render nothing
    return null
  }

  return (
    <Image
      {...props}
      alt={alt}
      className={`${className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
      onError={() => {
        setHasError(true)
        setIsLoading(false)
      }}
      onLoad={() => {
        setIsLoading(false)
      }}
    />
  )
}

/**
 * SafeLogo Component
 *
 * Specialized SafeImage for logo display with a letter fallback.
 * When the logo fails to load, shows the first letter of the name.
 */
interface SafeLogoProps extends Omit<SafeImageProps, 'fallback' | 'alt'> {
  name: string
  alt?: string
  size?: number
}

export function SafeLogo({ name, size = 64, className, ...props }: SafeLogoProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold rounded ${className || ''}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <Image
      {...props}
      alt={`${name} logo`}
      width={size}
      height={size}
      className={`${className || ''} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
      onError={() => {
        setHasError(true)
        setIsLoading(false)
      }}
      onLoad={() => {
        setIsLoading(false)
      }}
    />
  )
}
