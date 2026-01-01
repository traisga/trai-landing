import './globals.css'

export const metadata = {
  title: 'TrAi • Sanal Stil Asistanın',
  description: 'AI-powered virtual try-on and style assistant',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
