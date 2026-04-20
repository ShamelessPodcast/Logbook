import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* L-plate: vertical bar */}
        <div
          style={{
            position: 'absolute',
            left: 7,
            top: 4,
            width: 7,
            height: 22,
            background: '#FF0000',
          }}
        />
        {/* L-plate: horizontal bar */}
        <div
          style={{
            position: 'absolute',
            left: 7,
            top: 21,
            width: 18,
            height: 7,
            background: '#FF0000',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
