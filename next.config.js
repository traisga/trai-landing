/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      // Uyarı: Bu ayar, projede hata olsa bile build işleminin 
      // başarıyla tamamlanmasını sağlar.
      ignoreDuringBuilds: true,
    },
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  }
  
  module.exports = nextConfig
