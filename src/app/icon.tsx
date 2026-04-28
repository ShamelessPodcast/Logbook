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
          background: 'white',
          borderRadius: 6,
          display: 'flex',
          position: 'relative',
          border: '1px solid #D1D5DB',
        }}
      >
        {/* Vertical bar of L */}
        <div
          style={{
            position: 'absolute',
            left: 5,
            top: 3,
            width: 9,
            height: 26,
            background: '#DC2626',
            borderRadius: 1,
          }}
        />
        {/* Horizontal bar of L */}
        <div
          style={{
            position: 'absolute',
            left: 5,
            bottom: 3,
            width: 22,
            height: 7,
            background: '#DC2626',
            borderRadius: 1,
          }}
        />
      </div>
    ),
    { ...size }
  )
}
