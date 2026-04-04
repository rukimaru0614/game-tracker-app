// @ts-nocheck
// Analytics calculator functions
import { type GameRecord } from '../hooks/useGameData'

export interface AnalyticsData {
  estimatedMatchesToGoal: number
  averagePlacement: number
  highestRP: number
  currentStreak: number
}

export const calculateAnalyticsData = (records: GameRecord[], targetRP: number = 0): AnalyticsData => {
  if (records.length === 0) {
    return {
      estimatedMatchesToGoal: 0,
      averagePlacement: 0,
      highestRP: 0,
      currentStreak: 0
    }
  }

  // 直近5試合の平均RP上昇を計算
  const recentRecords = records.slice(-5)
  let totalRPChange = 0
  let validChanges = 0

  for (let i = 1; i < recentRecords.length; i++) {
    const change = recentRecords[i].points - recentRecords[i-1].points
    if (change > 0) {
      totalRPChange += change
      validChanges++
    }
  }

  const averageRPIncrease = validChanges > 0 ? totalRPChange / validChanges : 0
  
  // 目標までの推定試合数を計算
  const currentRP = recentRecords[recentRecords.length - 1]?.points || 0
  const remainingRP = Math.max(0, targetRP - currentRP)
  const estimatedMatchesToGoal = averageRPIncrease > 0 ? Math.ceil(remainingRP / averageRPIncrease) : 0

  const placements = records.filter(r => r.bestPlacement).map(r => r.bestPlacement!)
  const averagePlacement = placements.length > 0 
    ? placements.reduce((sum, p) => sum + p, 0) / placements.length 
    : 0
  const highestRP = Math.max(...records.map(r => r.points))

  return {
    estimatedMatchesToGoal,
    averagePlacement,
    highestRP,
    currentStreak: 0 // TODO: Implement streak calculation
  }
}
