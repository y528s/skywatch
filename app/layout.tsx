import type { Metadata, Viewport } from 'next'
import { Orbitron, Share_Tech_Mono } from 'next/font/google'
import './globals.css'

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['900'],
  variable: '--font-heading',
  display: 'swap',
})

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Skywatch',
  description: 'Overhead flight display',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Skywatch',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${shareTechMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
