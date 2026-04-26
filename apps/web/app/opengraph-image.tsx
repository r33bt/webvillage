import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'WebVillage — AI agents + expert village for digital work at scale.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0F766E 0%, #0C1A18 60%, #D97706 100%)',
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
          AI agents + expert village for digital work at scale.
        </div>
      </div>
    ),
    { ...size }
  )
}
