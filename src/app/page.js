'use client'

// TrAi App - Main Page
// The full app logic is in public/index.html for now
// This page serves as an entry point

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-[#2962FF] flex items-center justify-center mb-4 shadow-lg">
          <span className="text-white text-2xl font-black">TrAi</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">TrAi Style Assistant</h1>
        <p className="text-gray-500 mb-6">Sanal Stil Asistanın</p>
        <a 
          href="/app" 
          className="inline-block bg-[#2962FF] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#1E54E5] transition"
        >
          Uygulamayı Başlat
        </a>
      </div>
    </div>
  )
}
