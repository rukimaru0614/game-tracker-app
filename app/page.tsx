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
    setIsAuthenticated(true)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 動的インポートでハイドレーションエラーを物理的に消滅 */}
      {isAuthenticated && selectedGame && gameRecords ? <MainContent /> : <PasswordGate onAuthenticated={handleAuthenticated} />}
    </div>
  )
}
