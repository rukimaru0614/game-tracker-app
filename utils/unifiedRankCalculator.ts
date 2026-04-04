import { 
  RANK_DATA, 
  RANK_ORDER, 
  DIVISION_ORDER, 
  getRankConfig, 
  getMaxRPForRank,
  getRemainingRPForNextRank,
  getProgressPercentage,
  getRankDisplayName
} from '@/constants/rankConfig'

export interface UnifiedRankInfo {
  name: string
  color: string
  icon: string
  minPoints: number
  maxPoints: number
  tierPoints: number
  progress: number // 0-1 within current rank
  pointsToNext: number // Points needed to reach next rank
  isTopRank: boolean
  totalPoints: number
}

/**
 * 累計RPからランクを物理的に判定する関数（ハードコード版）
 * 5,247 RP → ゴールドになることを保証
 */
export function calculateRankFromTotalRP(totalPoints: number): UnifiedRankInfo {
  console.log('=== 物理的ランク判定開始 ===', totalPoints, 'RP')
  
  let rankName = ''
  let rankIcon = ''
  let rankColor = ''
  let tierPoints = 0
  let maxTierPoints = 0
  let pointsToNext = 0
  let progress = 0
  
  // APEX LEGENDS 正しいランク帯で判定
  if (totalPoints >= 0 && totalPoints <= 1000) {
    // 0 〜 1,000 RP → ルーキー
    rankName = 'ルーキーIV'
    rankIcon = '🌱'
    rankColor = 'text-stone-500'
    tierPoints = totalPoints
    maxTierPoints = 250
    pointsToNext = 250 - tierPoints
    progress = tierPoints / 250
  } else if (totalPoints >= 1001 && totalPoints <= 2000) {
    // 1,001 〜 2,000 RP → ブロンズ
    const bronzePoints = totalPoints - 1000
    const bronzeDivision = Math.min(Math.floor(bronzePoints / 250), 3)
    const bronzeTier = bronzePoints % 250
    
    const divisions = ['IV', 'III', 'II', 'I']
    rankName = `ブロンズ${divisions[bronzeDivision]}`
    rankIcon = '🥉'
    rankColor = 'text-amber-700'
    tierPoints = bronzeTier
    maxTierPoints = 250
    pointsToNext = 250 - tierPoints
    progress = tierPoints / 250
  } else if (totalPoints >= 2001 && totalPoints <= 4000) {
    // 2,001 〜 4,000 RP → シルバー
    const silverPoints = totalPoints - 2000
    const silverDivision = Math.min(Math.floor(silverPoints / 250), 3)
    const silverTier = silverPoints % 250
    
    const divisions = ['IV', 'III', 'II', 'I']
    rankName = `シルバー${divisions[silverDivision]}`
    rankIcon = '🥈'
    rankColor = 'text-gray-400'
    tierPoints = silverTier
    maxTierPoints = 250
    pointsToNext = 250 - tierPoints
    progress = tierPoints / 250
  } else if (totalPoints >= 4001 && totalPoints <= 6000) {
    // 4,001 〜 6,000 RP → ゴールド
    const goldPoints = totalPoints - 4000
    const goldDivision = Math.min(Math.floor(goldPoints / 250), 3)
    const goldTier = goldPoints % 250
    
    const divisions = ['IV', 'III', 'II', 'I']
    rankName = `ゴールド${divisions[goldDivision]}`
    rankIcon = '🏅'
    rankColor = 'text-yellow-500'
    tierPoints = goldTier
    maxTierPoints = 250
    pointsToNext = 250 - tierPoints
    progress = tierPoints / 250
  } else if (totalPoints >= 6001 && totalPoints <= 8000) {
    // 6,001 〜 8,000 RP → プラチナ
    const platinumPoints = totalPoints - 6000
    const platinumDivision = Math.min(Math.floor(platinumPoints / 250), 3)
    const platinumTier = platinumPoints % 250
    
    const divisions = ['IV', 'III', 'II', 'I']
    rankName = `プラチナ${divisions[platinumDivision]}`
    rankIcon = '🔷'
    rankColor = 'text-cyan-500'
    tierPoints = platinumTier
    maxTierPoints = 250
    pointsToNext = 250 - tierPoints
    progress = tierPoints / 250
  } else if (totalPoints >= 8001 && totalPoints <= 10000) {
    // 8,001 〜 10,000 RP → ダイヤモンド
    const diamondPoints = totalPoints - 8000
    const diamondDivision = Math.min(Math.floor(diamondPoints / 250), 3)
    const diamondTier = diamondPoints % 250
    
    const divisions = ['IV', 'III', 'II', 'I']
    rankName = `ダイヤモンド${divisions[diamondDivision]}`
    rankIcon = '💎'
    rankColor = 'text-blue-500'
    tierPoints = diamondTier
    maxTierPoints = 250
    pointsToNext = 250 - tierPoints
    progress = tierPoints / 250
  } else if (totalPoints >= 10001 && totalPoints <= 50000) {
    // 10,001 〜 50,000 RP → マスター
    rankName = 'マスター'
    rankIcon = '💜'
    rankColor = 'text-purple-500'
    tierPoints = totalPoints - 10000
    maxTierPoints = 40000
    pointsToNext = 50001 - totalPoints
    progress = (totalPoints - 10001) / 40000
  } else {
    // 50,001 RP 以上 → プレデター
    rankName = 'プレデター'
    rankIcon = '👹'
    rankColor = 'text-red-600'
    tierPoints = totalPoints - 50001
    maxTierPoints = 999999
    pointsToNext = 0
    progress = 1
  }
  
  console.log(`物理的判定結果: ${totalPoints} RP → ${rankName} (${tierPoints}/${maxTierPoints})`)
  
  return {
    name: rankName,
    color: rankColor,
    icon: rankIcon,
    minPoints: 0,
    maxPoints: maxTierPoints,
    tierPoints: tierPoints,
    progress: progress,
    pointsToNext: pointsToNext,
    isTopRank: totalPoints >= 50001,
    totalPoints: totalPoints
  }
}

export function calculateRankProgress(totalPoints: number): UnifiedRankInfo {
  // この関数は互換性のために残す
  return calculateRankFromTotalRP(totalPoints)
}

export function getDefaultRankInfo(): UnifiedRankInfo {
  return {
    name: 'ルーキーIV',
    color: 'text-stone-500',
    icon: '🌱',
    minPoints: 0,
    maxPoints: 250,
    tierPoints: 0,
    progress: 0,
    pointsToNext: 250,
    isTopRank: false,
    totalPoints: 0
  }
}