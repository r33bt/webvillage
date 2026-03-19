import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'WebVillage — Stop paying for 5 tools. Start with one.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7e22ce 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.1,
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          WebVillage
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
          }}
        >
          Stop paying for 5 tools. Start with one.
        </div>
      </div>
    ),
    { ...size }
  )
}
