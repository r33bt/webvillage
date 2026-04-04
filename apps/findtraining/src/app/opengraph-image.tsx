export const runtime = 'edge'

import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F6FEC',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* FT badge */}
        <div
          style={{
            width: 88,
            height: 88,
            background: 'white',
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 44,
            fontWeight: 900,
            color: '#0F6FEC',
            marginBottom: 36,
            letterSpacing: '-1px',
          }}
        >
          FT
        </div>

        {/* Wordmark */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-2px',
            marginBottom: 20,
          }}
        >
          FindTraining
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 30,
            color: 'rgba(255,255,255,0.82)',
            fontWeight: 400,
            letterSpacing: '-0.5px',
          }}
        >
          Malaysia&apos;s HRDF Training Provider Directory
        </div>
      </div>
    ),
    { ...size }
  )
}
