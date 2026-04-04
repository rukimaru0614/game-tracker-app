'use client'

import { useState, useEffect } from 'react'
import { Lock, Mail } from 'lucide-react'

const CORRECT_PASSWORD = 'IR614'

export default function PasswordGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // ハイドレーションエラー対策
  useEffect(() => {
    setIsMounted(true)
    
    // 永続的なログイン状態チェック
    try {
      const savedAuth = localStorage.getItem('app-authenticated')
      const authTime = localStorage.getItem('app-auth-time')
      
      if (savedAuth === 'true' && authTime) {
        const authDate = new Date(authTime)
        const now = new Date()
        const daysDiff = (now.getTime() - authDate.getTime()) / (1000 * 60 * 60 * 24)
        
        // 7日以内なら自動認証
        if (daysDiff < 7) {
          onAuthenticated()
          return
        }
      }
    } catch (error) {
      console.error('localStorage read error:', error)
    }
  }, [onAuthenticated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      if (password === CORRECT_PASSWORD) {
        // 認証成功
        localStorage.setItem('app-authenticated', 'true')
        localStorage.setItem('app-auth-time', new Date().toISOString())
        onAuthenticated()
      } else {
        setError(true)
        setTimeout(() => setError(false), 2000)
      }
    } catch (error) {
      console.error('Authentication error:', error)
      setError(true)
      setTimeout(() => setError(false), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  // ハイドレーションエラー対策 - マウント前は何も表示しない
  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 動的なポリゴン背景 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
        
        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* ガラスのような質感のカード */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8">
            {/* ヘッダー */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">ようこそ</h1>
              <p className="text-white/80 text-lg">パスワードを入力してください</p>
            </div>

            {/* フォーム */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  パスワード
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/60" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    placeholder="パスワードを入力"
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-400">パスワードが正しくありません</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    認証中...
                  </div>
                ) : (
                  'ログイン'
                )}
              </button>
            </form>

            {/* Googleログインボタン（今後の実装用） */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-white/60">または</span>
                </div>
              </div>
              <button
                type="button"
                disabled
                className="mt-4 w-full bg-white/10 border border-white/20 text-white py-3 px-4 rounded-xl font-semibold hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm flex items-center justify-center"
              >
                <Mail className="w-5 h-5 mr-2" />
                Googleでログイン（準備中）
              </button>
            </div>
          </div>

          {/* フッター */}
          <div className="text-center mt-8">
            <p className="text-white/60 text-sm">
              © 2024 Game Tracker. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.05);
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
