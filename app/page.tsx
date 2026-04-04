// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import MainContent from '../components/MainContent'
import PasswordGate from '../components/PasswordGate'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // ハイドレーション・セーフな実装
  useEffect(() => {
    setIsMounted(true)
    
    // localStorageを確認し、ログイン済みであればtrueに切り替え
    try {
      const savedAuth = localStorage.getItem('app-authenticated')
      const authTime = localStorage.getItem('app-auth-time')
      
      if (savedAuth === 'true' && authTime) {
        const authDate = new Date(authTime)
        const now = new Date()
        const daysDiff = (now.getTime() - authDate.getTime()) / (1000 * 60 * 60 * 24)
        
        // 7日以内なら自動認証
        if (daysDiff < 7) {
          setIsAuthenticated(true)
          return
        }
      }
    } catch (error) {
      console.error('localStorage read error:', error)
    }
  }, [])

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
  }

  // マウント完了まで何も表示しない（ハイドレーション・セーフ）
  if (!isMounted) {
    return null
  }

  // 完全な入れ替え - 共通の親要素の中で三項演算子を使用
  return (
    <div className="min-h-screen">
      {!isAuthenticated ? (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
          {/* 動的背景要素 */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
          
          {/* ロック画面 */}
          <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
            <PasswordGate onAuthenticated={handleAuthenticated} />
          </div>
        </div>
      ) : (
        <MainContent />
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.1;
            transform: scale(1);
          }
          50% {
            opacity: 0.15;
            transform: scale(1.02);
          }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
