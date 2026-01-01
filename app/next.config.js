// next.config.js
// Mevcut config'inize bu ayarları ekleyin

/** @type {import('next').NextConfig} */
const nextConfig = {
  // API route'ları için timeout süresini uzat (Gemini için gerekli)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  
  // Resim optimizasyonu için domain izinleri
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
};

module.exports = nextConfig;
