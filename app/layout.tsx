import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import AuthProvider from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1a1a1a',
}

export const metadata: Metadata = {
  title: 'Game Tracker',
  description: 'ゲームのポイント推移を記録・可視化するアプリ - 開発者: IR',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.jpg?v=3', type: 'image/jpeg' },
    ],
    apple: [
      { url: '/icon.jpg?v=3', type: 'image/jpeg', sizes: '180x180' },
      { url: '/icon.jpg?v=3', type: 'image/jpeg', sizes: '192x192' },
      { url: '/icon.jpg?v=3', type: 'image/jpeg', sizes: '512x512' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="dark">
      <head>
        <link rel="icon" href="/icon.jpg?v=3" type="image/jpeg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon.jpg?v=3" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon.jpg?v=3" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon.jpg?v=3" />
        <meta name="apple-mobile-web-app-title" content="Game Tracker" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen flex flex-col`}>
        <AuthProvider>
          <div className="flex-1">
            {children}
          </div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  )
}
