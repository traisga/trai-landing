// app/layout.js
export const metadata = {
  title: 'TrAi - Sanal Stil Asistanın',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}