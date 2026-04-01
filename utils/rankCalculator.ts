import { RankThreshold, getRankThresholds } from '@/constants/rankThresholds'
import { Game } from '@/types/game'

export interface RankInfo {
  name: string
  color: string
  icon: string
  minPoints: number
  maxPoints?: number
  progress: number // 0-1 within current rank
  pointsToNext: number // Points needed to reach next rank
  isTopRank: boolean
}

export function calculateRank(points: number, game: Game): RankInfo {
  // Ensure points is a number
  const numericPoints = Number(points)
  console.log(`Rank calculation for ${game.name}: ${numericPoints} points (type: ${typeof numericPoints})`)
  
  if (isNaN(numericPoints) || numericPoints < 0) {
    console.log('Invalid points, returning default rank')
    return {
      name: 'ルーキー',
      color: 'text-stone-500',
      icon: '🌱',
      minPoints: 0,
      maxPoints: 999,
      progress: 0,
      pointsToNext: 1000,
      isTopRank: false
    }
  }

  const thresholds = getRankThresholds(game.name)
  console.log(`Using thresholds for ${game.name}:`, thresholds.map(t => ({ name: t.name, min: t.minPoints, max: t.maxPoints })))
  
  // Find the current rank using proper if-else logic (highest to lowest)
  let currentRank: RankThreshold | null = null
  
  // Check from highest rank to lowest
  for (const threshold of thresholds) {
    if (numericPoints >= threshold.minPoints) {
      // Check if there's a maxPoints constraint
      if (threshold.maxPoints === undefined || numericPoints <= threshold.maxPoints) {
        currentRank = threshold
        break
      }
    }
  }
  
  // Fallback to lowest rank if nothing matched
  if (!currentRank) {
    currentRank = thresholds[thresholds.length - 1]
  }
  
  console.log(`Determined rank: ${currentRank.name} (${currentRank.minPoints}-${currentRank.maxPoints || '∞'})`)
  
  // Calculate progress within current rank
  const nextRank = thresholds.find(t => t.minPoints > currentRank!.minPoints)
  const rankRange = nextRank 
    ? nextRank.minPoints - currentRank.minPoints
    : 0 // Top rank has no range
  
  const progress = rankRange > 0 
    ? Math.min(1, Math.max(0, (numericPoints - currentRank.minPoints) / rankRange))
    : 1 // Top rank is always 100%
  
  // Calculate points needed for next rank
  const pointsToNext = nextRank 
    ? nextRank.minPoints - numericPoints
    : 0 // Already at top rank
  
  const result = {
    name: currentRank.name,
    color: currentRank.color,
    icon: currentRank.icon || '🏆',
    minPoints: currentRank.minPoints,
    maxPoints: currentRank.maxPoints,
    progress,
    pointsToNext,
    isTopRank: !nextRank
  }
  
  console.log('Rank result:', result)
  return result
}

export function getRankWithDivision(points: number, game: Game): RankInfo {
  const baseRank = calculateRank(points, game)
  
  // For League of Legends, calculate division
  if (game.name.toLowerCase().includes('league') || game.name.toLowerCase().includes('lol')) {
    return calculateLolDivision(points, baseRank)
  }
  
  return baseRank
}

function calculateLolDivision(points: number, baseRank: RankInfo): RankInfo {
  // Simplified LoL division calculation (since we're using simplified thresholds)
  return baseRank
}

export function getRankProgressPercentage(points: number, game: Game): number {
  const rank = calculateRank(points, game)
  return Math.round(rank.progress * 100)
}

export function getPointsToNextRank(points: number, game: Game): number {
  const rank = calculateRank(points, game)
  return rank.pointsToNext
}

export function isTopRank(points: number, game: Game): boolean {
  const rank = calculateRank(points, game)
  return rank.isTopRank
}

// Helper function to get rank color for styling
export function getRankColor(points: number, game: Game): string {
  const rank = calculateRank(points, game)
  return rank.color
}

// Helper function to get rank icon
export function getRankIcon(points: number, game: Game): string {
  const rank = calculateRank(points, game)
  return rank.icon
}

// Helper function to get rank name
export function getRankName(points: number, game: Game): string {
  const rank = calculateRank(points, game)
  return rank.name
}
