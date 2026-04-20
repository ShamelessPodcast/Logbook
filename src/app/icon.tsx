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
          background: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 4,
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: 22,
            fontWeight: 900,
            fontFamily: 'serif',
            lineHeight: 1,
            marginTop: 2,
            letterSpacing: '-0.02em',
          }}
        >
          L
        </span>
      </div>
    ),
    { ...size }
  )
}
