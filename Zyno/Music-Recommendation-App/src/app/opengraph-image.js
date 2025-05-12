// app/opengraph-image.js
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Music Recommendation App';
export const size = {
  width: 1200,
  height: 630,
};

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom, #1a1a1a, #121212)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div style={{ fontSize: '100px', marginBottom: '20px' }}>🎵</div>
        <div
          style={{
            fontSize: '60px',
            background: 'linear-gradient(to right, #1DB954, #1ed760)',
            backgroundClip: 'text',
            color: 'transparent',
            fontWeight: 'bold',
          }}
        >
          Music Recommendation
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}