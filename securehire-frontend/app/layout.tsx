import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SecureHire',
  description: 'SecureHire es una herramienta para reclutadores, orientada a la gestión de procesos de selección de personal.',
  icons: {
    icon: '/favicon.ico', 
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
