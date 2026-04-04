import { GameRecord } from '@/types/game'
import { calculateRankFromTotalRP } from './unifiedRankCalculator'

// 分析データの型定義
export interface AnalyticsData {
  averagePlacement: number
  promotionPrediction: {
    currentRP: number
    targetRP: number
    pointsNeeded: number
    estimatedGames: number
    targetRank: string
  }
  performanceTrend: {
    last5Games: number[]
    trend: 'improving' | 'stable' | 'declining'
    changeRate: number
  }
  goalProgress: {
    currentRP: number
    goalRP: number
    progressPercentage: number
    isAchieved: boolean
  }
}

/**
 * 平均順位を計算する共通ロジック
 * デバイスを問わず同じ計算式を使用
 */
export function calculateAveragePlacement(records: GameRecord[]): number {
  if (records.length === 0) return 0
  
  const validPlacements = records
    .filter(record => record.bestPlacement && record.bestPlacement > 0)
    .map(record => record.bestPlacement!)
  
  if (validPlacements.length === 0) return 0
  
  const sum = validPlacements.reduce((acc, placement) => acc + placement, 0)
  return Math.round((sum / validPlacements.length) * 10) / 10
}

/**
 * 昇格予測を計算する共通ロジック
 * 次のランクまでの必要RPと予想ゲーム数を計算
 */
export function calculatePromotionPrediction(currentRP: number, averagePlacement: number): AnalyticsData['promotionPrediction'] {
  const currentRank = calculateRankFromTotalRP(currentRP)
  
  // 次のランクを取得
  let targetRP = currentRP
  let targetRank = currentRank.name
  
  // ランク境界を計算（ハードコードされたしきい値を使用）
  if (currentRP <= 1000) {
    targetRP = 1001
    targetRank = 'ブロンズIV'
  } else if (currentRP <= 3000) {
    targetRP = 3001
    targetRank = 'シルバーIV'
  } else if (currentRP <= 5250) {
    targetRP = 5251
    targetRank = 'ゴールドIV'
  } else if (currentRP <= 8250) {
    targetRP = 8251
    targetRank = 'プラチナIV'
  } else {
    // すでに高ランクの場合
    return {
      currentRP,
      targetRP: currentRP + 1000,
      pointsNeeded: 1000,
      estimatedGames: Math.ceil(1000 / Math.max(10, 100 - averagePlacement * 2)),
      targetRank: '次のランク'
    }
  }
  
  const pointsNeeded = targetRP - currentRP
  
  // 平均順位から1ゲームあたりの獲得RPを予測
  const avgPointsPerGame = Math.max(10, 100 - averagePlacement * 2)
  const estimatedGames = Math.ceil(pointsNeeded / avgPointsPerGame)
  
  return {
    currentRP,
    targetRP,
    pointsNeeded,
    estimatedGames,
    targetRank
  }
}

/**
 * パフォーマンストレンドを計算する共通ロジック
 */
export function calculatePerformanceTrend(records: GameRecord[]): AnalyticsData['performanceTrend'] {
  const recentRecords = records.slice(-5)
  const placements = recentRecords
    .filter(record => record.bestPlacement && record.bestPlacement > 0)
    .map(record => record.bestPlacement!)
  
  if (placements.length < 2) {
    return {
      last5Games: placements,
      trend: 'stable',
      changeRate: 0
    }
  }
  
  // 最初と最後の平均を比較
  const firstHalf = placements.slice(0, Math.ceil(placements.length / 2))
  const secondHalf = placements.slice(Math.ceil(placements.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, p) => sum + p, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, p) => sum + p, 0) / secondHalf.length
  
  const changeRate = ((firstAvg - secondAvg) / firstAvg) * 100
  
  let trend: 'improving' | 'stable' | 'declining'
  if (changeRate > 10) {
    trend = 'improving'
  } else if (changeRate < -10) {
    trend = 'declining'
  } else {
    trend = 'stable'
  }
  
  return {
    last5Games: placements,
    trend,
    changeRate: Math.round(changeRate * 10) / 10
  }
}

/**
 * 目標進捗を計算する共通ロジック
 */
export function calculateGoalProgress(currentRP: number, goalRP: number): AnalyticsData['goalProgress'] {
  const progressPercentage = Math.min(100, Math.round((currentRP / goalRP) * 100))
  const isAchieved = currentRP >= goalRP
  
  return {
    currentRP,
    goalRP,
    progressPercentage,
    isAchieved
  }
}

/**
 * すべての分析データを統合して計算するメイン関数
 */
export function calculateAnalyticsData(records: GameRecord[], goalRP: number = 8000): AnalyticsData {
  const averagePlacement = calculateAveragePlacement(records)
  const latestRecord = records[records.length - 1]
  const currentRP = latestRecord ? latestRecord.points : 0
  
  const promotionPrediction = calculatePromotionPrediction(currentRP, averagePlacement)
  const performanceTrend = calculatePerformanceTrend(records)
  const goalProgress = calculateGoalProgress(currentRP, goalRP)
  
  return {
    averagePlacement,
    promotionPrediction,
    performanceTrend,
    goalProgress
  }
}

/**
 * 目標ラインのRP値を計算（グラフ用）
 */
export function getGoalLines(goalRP: number): Array<{ rp: number; label: string; color: string }> {
  return [
    { rp: 1000, label: 'ブロンズ', color: '#92400e' },
    { rp: 3000, label: 'シルバー', color: '#6b7280' },
    { rp: 5250, label: 'ゴールド', color: '#eab308' },
    { rp: 8250, label: 'プラチナ', color: '#06b6d4' },
    { rp: goalRP, label: '目標', color: '#dc2626' }
  ]
}
