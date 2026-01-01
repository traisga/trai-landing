// pages/index.js
// Bu dosya ana uygulamayı yükler
// Ana uygulama kodu public/app.html dosyasında

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the main app HTML
    window.location.href = '/app.html'
  }, [])

  return (
    <>
      <Head>
        <title>TrAi • Sanal Stil Asistanın</title>
      </Head>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#F5F5F7'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 64, 
            height: 64, 
            borderRadius: 16, 
            background: '#2962FF', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px',
            animation: 'pulse 2s infinite'
          }}>
            <span style={{ fontSize: 32 }}>✨</span>
          </div>
          <p style={{ color: '#666' }}>Yükleniyor...</p>
        </div>
      </div>
    </>
  )
}
