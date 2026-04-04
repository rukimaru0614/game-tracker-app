// @ts-nocheck
'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { ChevronDown, AlertCircle, Trophy, Target, TrendingUp, Calendar, BarChart3, Users, Zap } from 'lucide-react'
import { useGameData, type Game, type GameRecord } from '../hooks/useGameData'
import { calculateRankFromTotalRP } from '../utils/unifiedRankCalculator'
import { getGameRankGroups, isGameRankingBased, getGameValidDivisions } from '../utils/gameUtils'
import { getGameRankThresholds } from '../utils/rankThresholds'
import { calculateAnalyticsData, type AnalyticsData } from '../utils/analyticsCalculator'
import { getGoalLines, type GoalLine } from '../utils/goalLines'
import PasswordGate from '../components/PasswordGate'

// 動的インポートでハイドレーションエラーを物理的に消滅
const MainContent = dynamic(() => import('../components/MainContent'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="text-xl text-gray-400">読み込み中...</div></div>
})

// 目標ポイント設定の型
interface GoalSettings {
  targetRP: number
  targetRank: string
  deadline: string
  isActive: boolean
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { 
    selectedGame, 
    gameRecords
  } = useGameData()

  const handleAuthenticated = () => {
    console.log('🔐 Authentication callback received in Home component')
    setIsAuthenticated(true)
    console.log('🔐 isAuthenticated set to true')
  }

  // 認証状態の初期化
  useEffect(() => {
    console.log('🔐 Checking authentication status...')
    try {
      const savedAuth = localStorage.getItem('app-authenticated')
      const authTime = localStorage.getItem('app-auth-time')
      
      console.log('🔐 Saved auth data:', { savedAuth, authTime })
      
      if (savedAuth === 'true' && authTime) {
        const authDate = new Date(authTime)
        const now = new Date()
        const hoursDiff = (now.getTime() - authDate.getTime()) / (1000 * 60 * 60)
        
        console.log('🔐 Time difference:', hoursDiff, 'hours')
        
        // 24時間以内なら再認証不要
        if (hoursDiff < 24) {
          console.log('🔐 Auto-authenticating...')
          setIsAuthenticated(true)
          return
        }
      }
    } catch (error) {
      console.error('localStorage read error:', error)
    }
    console.log('🔐 Authentication required')
  }, [])

  console.log('🔐 Render state:', { isAuthenticated, hasSelectedGame: !!selectedGame, hasRecords: !!gameRecords })

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 動的インポートでハイドレーションエラーを物理的に消滅 */}
      {isAuthenticated ? (
        selectedGame && gameRecords ? <MainContent /> : <div className="flex items-center justify-center min-h-screen"><div className="text-xl text-gray-400">読み込み中...</div></div>
      ) : (
        <PasswordGate onAuthenticated={handleAuthenticated} />
      )}
    </div>
  )
}
