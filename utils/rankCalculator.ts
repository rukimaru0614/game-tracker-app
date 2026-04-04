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
  tierPoints: number // ティア内RP
  totalPoints: number // 累計RP
}

export function calculateRank(totalPoints: number, game: Game): RankInfo {
  // Ensure points is a number
  const numericPoints = Number(totalPoints)
  console.log(`Rank calculation for ${game.name}: ${numericPoints} total points (type: ${typeof numericPoints})`)
  
  if (isNaN(numericPoints) || numericPoints < 0) {
    console.log('Invalid points, returning default rank')
    return {
      name: 'ブロンズ',
      color: 'text-amber-700',
      icon: '🥉',
      minPoints: 0,
      maxPoints: 2399,
      progress: 0,
      pointsToNext: 2400,
      isTopRank: false,
      tierPoints: 0,
      totalPoints: 0
    }
  }

  const thresholds = getRankThresholds(game.name)
  console.log(`Using thresholds for ${game.name}:`, thresholds.map(t => ({ name: t.name, min: t.minPoints, max: t.maxPoints })))
  
  // Find the current rank - LOWEST TO HIGHEST (correct logic)
  let currentRank: RankThreshold | null = null
  
  // Sort thresholds from lowest to highest (correct order)
  const sortedThresholds = [...thresholds].sort((a, b) => a.minPoints - b.minPoints)
  
  // Check from lowest rank to highest
  for (let i = sortedThresholds.length - 1; i >= 0; i--) {
    const threshold = sortedThresholds[i]
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
    currentRank = sortedThresholds[0]
  }
  
  console.log(`Determined rank: ${currentRank.name} (${currentRank.minPoints}-${currentRank.maxPoints || '∞'})`)
  
  // Calculate tier points (points within current rank)
  const tierPoints = numericPoints - currentRank.minPoints
  
  // Calculate progress within current rank
  const currentRankIndex = sortedThresholds.findIndex(t => t.minPoints === currentRank!.minPoints)
  // 次のランクはインデックスが小さい方（より高いランク）
  const nextRank = currentRankIndex < sortedThresholds.length - 1 ? sortedThresholds[currentRankIndex + 1] : null
  const rankRange = nextRank 
    ? nextRank.minPoints - currentRank.minPoints
    : 0 // Top rank has no range
  
  const progress = rankRange > 0 
    ? Math.min(1, Math.max(0, tierPoints / rankRange))
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
    isTopRank: !nextRank,
    tierPoints,
    totalPoints: numericPoints
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

// 新しい判定ロジック：現在のランク + ティア内RPでランクを決定
export function calculateRankFromTier(currentTier: string, tierPoints: number, game: Game): RankInfo {
  const thresholds = getRankThresholds(game.name)
  const currentRankThreshold = thresholds.find(t => t.name === currentTier)
  
  if (!currentRankThreshold) {
    console.error(`Rank ${currentTier} not found for game ${game.name}`)
    // フォールバック：最低ランクとして計算
    return calculateRank(tierPoints, game)
  }
  
  // ティア内RPのバリデーション
  const maxTierPoints = currentRankThreshold.maxPoints 
    ? currentRankThreshold.maxPoints - currentRankThreshold.minPoints
    : 99999 // マスターなど上限なしの場合
  
  const validTierPoints = Math.max(0, Math.min(tierPoints, maxTierPoints))
  
  // 累計RPを計算
  const totalPoints = currentRankThreshold.minPoints + validTierPoints
  
  // ランク情報を取得
  const rankInfo = calculateRank(totalPoints, game)
  
  // ティア内RPを上書き
  rankInfo.tierPoints = validTierPoints
  rankInfo.totalPoints = totalPoints
  
  return rankInfo
}

// ティア内RPのバリデーション関数
export function validateTierPoints(tierPoints: number, currentTier: string, game: Game): {
  isValid: boolean
  maxPoints: number
  errorMessage?: string
} {
  const thresholds = getRankThresholds(game.name)
  const rankThreshold = thresholds.find(t => t.name === currentTier)
  
  if (!rankThreshold) {
    return {
      isValid: false,
      maxPoints: 0,
      errorMessage: `ランク ${currentTier} が見つかりません`
    }
  }
  
  const maxTierPoints = rankThreshold.maxPoints 
    ? rankThreshold.maxPoints - rankThreshold.minPoints
    : 99999
  
  const isValid = tierPoints >= 0 && tierPoints <= maxTierPoints
  
  return {
    isValid,
    maxPoints: maxTierPoints,
    errorMessage: isValid ? undefined : `ティア内RPは 0〜${maxTierPoints} の範囲で入力してください`
  }
}

// ランク上限RPを取得
export function getMaxTierPoints(tierName: string, game: Game): number {
  const thresholds = getRankThresholds(game.name)
  const rankThreshold = thresholds.find(t => t.name === tierName)
  
  if (!rankThreshold) return 0
  
  return rankThreshold.maxPoints 
    ? rankThreshold.maxPoints - rankThreshold.minPoints
    : 99999
}
export function testRankBoundaries(game: Game): void {
  const thresholds = getRankThresholds(game.name)
  const sortedThresholds = [...thresholds].sort((a, b) => a.minPoints - b.minPoints)
  
  console.log(`\n=== ${game.name} ランク境界値テスト ===`)
  
  sortedThresholds.forEach((threshold, index) => {
    // 最小値テスト
    const minResult = calculateRank(threshold.minPoints, game)
    console.log(`${threshold.name} 最小値 (${threshold.minPoints}): ${minResult.name} (ティア内RP: ${minResult.tierPoints})`)
    
    // 最大値テスト（存在する場合）
    if (threshold.maxPoints !== undefined) {
      const maxResult = calculateRank(threshold.maxPoints, game)
      console.log(`${threshold.name} 最大値 (${threshold.maxPoints}): ${maxResult.name} (ティア内RP: ${maxResult.tierPoints})`)
      
      // 境界値テスト（最大値+1）
      if (index > 0) {
        const nextRankResult = calculateRank(threshold.maxPoints + 1, game)
        console.log(`境界値+1 (${threshold.maxPoints + 1}): ${nextRankResult.name} (ティア内RP: ${nextRankResult.tierPoints})`)
      }
    }
  })
  
  console.log(`=== テスト完了 ===\n`)
}

// ランク昇格処理関数
export function processRankPromotion(
  previousTotalPoints: number,
  newTotalPoints: number,
  game: Game
): { rankInfo: RankInfo; wasPromoted: boolean; promotionMessage?: string } {
  const previousRank = calculateRank(previousTotalPoints, game)
  const newRank = calculateRank(newTotalPoints, game)
  
  const wasPromoted = previousRank.name !== newRank.name
  
  let promotionMessage: string | undefined
  
  if (wasPromoted) {
    // 昇格メッセージを生成
    if (newRank.tierPoints === 0) {
      promotionMessage = `🎉 ${previousRank.name}から${newRank.name}に昇格！ティア内RPがリセットされました。`
    } else {
      promotionMessage = `🎉 ${previousRank.name}から${newRank.name}に昇格！`
    }
  }
  
  return {
    rankInfo: newRank,
    wasPromoted,
    promotionMessage
  }
}

// ティア内RPを計算する関数
export function calculateTierPoints(totalPoints: number, game: Game): number {
  const rankInfo = calculateRank(totalPoints, game)
  return rankInfo.tierPoints
}

// ティア内RPから累計RPを計算する関数
export function calculateTotalPoints(tierPoints: number, rankName: string, game: Game): number {
  const thresholds = getRankThresholds(game.name)
  const rank = thresholds.find(t => t.name === rankName)
  
  if (!rank) {
    console.error(`Rank ${rankName} not found for game ${game.name}`)
    return tierPoints
  }
  
  return rank.minPoints + tierPoints
}
