// app/not-found.js
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#121212] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl text-[#1DB954] mb-6">🎵</div>
        <h1 className="text-3xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-gray-300 mb-8">
          Sorry, we couldn't find the page you're looking for. The music plays on elsewhere.
        </p>
        <Link href="/" className="py-3 px-6 bg-[#1DB954] text-white rounded-xl hover:bg-[#1ed760] transition-colors">
          Return to Home
        </Link>
      </div>
    </div>
  );
}