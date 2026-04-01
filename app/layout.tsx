import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import AuthProvider from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Game Tracker',
  description: 'ゲームのポイント推移を記録・可視化するアプリ - 開発者: IR',
  manifest: '/manifest.json',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#1a1a1a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="dark">
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
