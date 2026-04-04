'use client'

import { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'

const CORRECT_PASSWORD = process.env.NEXT_PUBLIC_PASSWORD || 'IR614'

export default function PasswordGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const savedAuth = localStorage.getItem('app-authenticated')
    const authTime = localStorage.getItem('app-auth-time')
    
    if (savedAuth === 'true' && authTime) {
      const authDate = new Date(authTime)
      const now = new Date()
      const hoursDiff = (now.getTime() - authDate.getTime()) / (1000 * 60 * 60)
      
      // 24時間以内なら再認証不要
      if (hoursDiff < 24) {
        setIsAuthenticated(true)
        onAuthenticated()
        return
      }
    }
  }, [onAuthenticated])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('app-authenticated', 'true')
      localStorage.setItem('app-auth-time', new Date().toISOString())
      
      // ブラウザ履歴を置き換えてパスワード画面に戻らないようにする
      window.history.replaceState(null, '', '/')
      
      onAuthenticated()
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
    }
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
        <div className="flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-blue-500" />
        </div>
        
        <h2 className="text-xl font-bold text-center mb-4">認証が必要です</h2>
        <p className="text-gray-400 text-sm text-center mb-6">
          合言葉を入力してアプリにアクセスしてください
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label htmlFor="password-input" className="sr-only">合言葉</label>
            <input
              id="password-input"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="合言葉"
              className={`w-full px-3 py-2 bg-gray-700 rounded-lg text-white pr-10 ${
                error ? 'border border-red-500' : 'border border-gray-600'
              }`}
              autoFocus
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Password visibility toggle clicked, current state:', showPassword)
                setShowPassword(!showPassword)
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
              aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
              style={{ touchAction: 'manipulation' }}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm text-center">合言葉が正しくありません</p>
          )}
          
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            認証
          </button>
        </form>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          ヒント: 開発者のイニシャル＋数字
        </p>
      </div>
    </div>
  )
}
