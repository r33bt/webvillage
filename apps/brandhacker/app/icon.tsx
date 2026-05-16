import { ImageResponse } from 'next/og'
import { colors } from '@/lib/design/tokens'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: colors.background,
          color: colors.foreground,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          letterSpacing: '-0.05em',
        }}
      >
        B
      </div>
    ),
    { ...size }
  )
}
