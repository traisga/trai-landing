/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#2962FF',
        ink: '#111111',
        surface: '#FFFFFF',
        muted: '#6B7280'
      }
    }
  },
  plugins: []
}
