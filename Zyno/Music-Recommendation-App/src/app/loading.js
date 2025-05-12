// app/loading.js
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#121212] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#1DB954] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl text-white font-medium">Loading your music...</h2>
      </div>
    </div>
  );
}