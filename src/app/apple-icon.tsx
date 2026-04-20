import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#DC2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 22,
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize: 124,
            fontWeight: 900,
            fontFamily: 'serif',
            lineHeight: 1,
            marginTop: 10,
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
