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
          background: 'white',
          borderRadius: 36,
          display: 'flex',
          position: 'relative',
          border: '2px solid #D1D5DB',
        }}
      >
        {/* Vertical bar of L */}
        <div
          style={{
            position: 'absolute',
            left: 30,
            top: 18,
            width: 50,
            height: 145,
            background: '#DC2626',
            borderRadius: 4,
          }}
        />
        {/* Horizontal bar of L */}
        <div
          style={{
            position: 'absolute',
            left: 30,
            bottom: 18,
            width: 125,
            height: 42,
            background: '#DC2626',
            borderRadius: 4,
          }}
        />
      </div>
    ),
    { ...size }
  )
}
