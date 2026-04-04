export const runtime = 'edge'

import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F6FEC',
          borderRadius: 6,
          fontSize: 18,
          fontWeight: 800,
          color: 'white',
          letterSpacing: '-0.5px',
        }}
      >
        FT
      </div>
    ),
    { ...size }
  )
}
