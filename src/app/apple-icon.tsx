import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
        }}
      >
        {/* L-plate: vertical bar */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 22,
            width: 40,
            height: 120,
            background: '#FF0000',
            borderRadius: 4,
          }}
        />
        {/* L-plate: horizontal bar */}
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 118,
            width: 100,
            height: 40,
            background: '#FF0000',
            borderRadius: 4,
          }}
        />
      </div>
    ),
    { ...size }
  )
}
