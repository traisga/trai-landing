// app/page.js
'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    window.location.href = '/app.html';
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      background: '#F5F5F7'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
        <p style={{ color: '#666' }}>Yükleniyor...</p>
      </div>
    </div>
  );
}
