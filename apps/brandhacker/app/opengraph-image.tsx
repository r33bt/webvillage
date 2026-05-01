import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'BrandHacker — One brand. Every surface.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#09090b',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top: wordmark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              background: '#fafafa',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 700,
              color: '#09090b',
              letterSpacing: '-0.04em',
            }}
          >
            B
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 600,
              color: '#fafafa',
              letterSpacing: '-0.02em',
            }}
          >
            BrandHacker
          </div>
        </div>

        {/* Centre: headline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              color: '#fafafa',
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
            }}
          >
            One brand.
            <br />
            Every surface.
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#a1a1aa',
              letterSpacing: '-0.01em',
              lineHeight: 1.4,
            }}
          >
            Brand consistency without the overhead.
          </div>
        </div>

        {/* Bottom: domain */}
        <div
          style={{
            fontSize: '18px',
            color: '#52525b',
            letterSpacing: '0.04em',
          }}
        >
          brandhacker.com
        </div>
      </div>
    ),
    { ...size }
  )
}
