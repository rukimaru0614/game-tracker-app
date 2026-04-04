// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useGameData, type Game, type GameRecord } from '../hooks/useGameData'
import MainContent from '../components/MainContent'
import PasswordGate from '../components/PasswordGate'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { 
    selectedGame, 
    gameRecords
  } = useGameData()

  // ハイドレーションエラー対策
  useEffect(() => {
    setIsMounted(true)
    
    // localStorageを確認し、すでにログイン済みの場合は最初からtrueに設定
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
    setIsTransitioning(true)
    setTimeout(() => {
      setIsAuthenticated(true)
      setIsTransitioning(false)
    }, 300) // フェードアウト時間
  }

  // マウント完了までのハイドレーションガード
  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 排他的レンダリング - どちらか一方のみを表示 */}
      {!isAuthenticated ? (
        <div className={`transition-opacity duration-300 ease-in-out ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}>
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
        </div>
      ) : (
        <div className={`transition-all duration-700 ease-in-out transform ${
          isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}>
          <MainContent />
        </div>
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
