import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#fafafa',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 700,
          color: '#09090b',
          letterSpacing: '-0.04em',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        B
      </div>
    ),
    { ...size },
  )
}
