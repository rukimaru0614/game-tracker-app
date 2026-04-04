import { GameRecord } from '@/types/game'
import { GAME_RANK_SYSTEMS, getGameRankSystem, getGameRanks } from '@/constants/gameRankSystems'

// ゲーム別ランク情報の型定義
export interface GameRankInfo {
  name: string
  color: string
  icon: string
  minPoints: number
  maxPoints: number
  tierPoints: number
  progress: number
  pointsToNext: number
  isTopRank: boolean
  totalPoints: number
  division?: string
}

/**
 * ゲーム別の動的ランク判定関数
 * @param gameId ゲームID
 * @param totalPoints 総ポイント
 * @returns ゲーム別ランク情報
 */
export function calculateGameRank(gameId: string, totalPoints: number): GameRankInfo {
  console.log(`=== ゲーム別ランク判定開始 ===`, `${gameId}: ${totalPoints} ポイント`)
  
  const system = getGameRankSystem(gameId)
  const ranks = system.ranks
  const thresholds = system.thresholds
  
  // Apex Legendsの特殊処理
  if (gameId === 'apex-legends') {
    // 正確な累計RPで判定
    if (totalPoints < 1000) {
      // ルーキー (0-999 RP)
      const tierPoints = totalPoints
      const maxTierPoints = 250
      const divisionIndex = Math.min(Math.floor(tierPoints / 250), 3)
      const divisions = ['IV', 'III', 'II', 'I']
      const division = divisions[3 - divisionIndex]
      const actualTierPoints = tierPoints % 250
      
      return {
        name: `ルーキー ${division}`,
        color: 'text-stone-500',
        icon: '🌱',
        minPoints: 0,
        maxPoints: 250,
        tierPoints: actualTierPoints,
        progress: actualTierPoints / 250,
        pointsToNext: 250 - actualTierPoints,
        isTopRank: false,
        totalPoints: totalPoints,
        division: division
      }
    } else if (totalPoints < 3000) {
      // ブロンズ (1000-2999 RP)
      const tierPoints = totalPoints - 1000
      const maxTierPoints = 500
      const divisionIndex = Math.min(Math.floor(tierPoints / 500), 3)
      const divisions = ['IV', 'III', 'II', 'I']
      const division = divisions[3 - divisionIndex]
      const actualTierPoints = tierPoints % 500
      
      return {
        name: `ブロンズ ${division}`,
        color: 'text-amber-700',
        icon: '🥉',
        minPoints: 1000,
        maxPoints: 500,
        tierPoints: actualTierPoints,
        progress: actualTierPoints / 500,
        pointsToNext: 500 - actualTierPoints,
        isTopRank: false,
        totalPoints: totalPoints,
        division: division
      }
    } else if (totalPoints < 5250) {
      // シルバー (3000-5249 RP) - 500+500+500+750 = 2,250 RP
      const tierPoints = totalPoints - 3000
      
      // ティア別のしきい値を判定
      let maxTierPoints = 500
      let division = ''
      let actualTierPoints = 0
      
      if (tierPoints < 500) {
        // シルバー IV (0-499)
        maxTierPoints = 500
        division = 'IV'
        actualTierPoints = tierPoints
      } else if (tierPoints < 1000) {
        // シルバー III (500-999)
        maxTierPoints = 500
        division = 'III'
        actualTierPoints = tierPoints - 500
      } else if (tierPoints < 1500) {
        // シルバー II (1000-1499)
        maxTierPoints = 500
        division = 'II'
        actualTierPoints = tierPoints - 1000
      } else if (tierPoints < 2250) {
        // シルバー I (1500-2249) ← ここだけ750！
        maxTierPoints = 750
        division = 'I'
        actualTierPoints = tierPoints - 1500
      }
      
      return {
        name: `シルバー ${division}`,
        color: 'text-gray-400',
        icon: '🥈',
        minPoints: 3000,
        maxPoints: maxTierPoints,
        tierPoints: actualTierPoints,
        progress: actualTierPoints / maxTierPoints,
        pointsToNext: maxTierPoints - actualTierPoints,
        isTopRank: false,
        totalPoints: totalPoints,
        division: division
      }
    } else if (totalPoints < 8450) {
      // ゴールド (5250-8449 RP) - 800 RP × 4 = 3,200 RP
      const tierPoints = totalPoints - 5250
      const maxTierPoints = 800
      const divisionIndex = Math.min(Math.floor(tierPoints / 800), 3)
      const divisions = ['IV', 'III', 'II', 'I']
      const division = divisions[3 - divisionIndex]
      const actualTierPoints = tierPoints % 800
      
      return {
        name: `ゴールド ${division}`,
        color: 'text-yellow-500',
        icon: '🏅',
        minPoints: 5250,
        maxPoints: 800,
        tierPoints: actualTierPoints,
        progress: actualTierPoints / 800,
        pointsToNext: 800 - actualTierPoints,
        isTopRank: false,
        totalPoints: totalPoints,
        division: division
      }
    } else if (totalPoints < 11450) {
      // プラチナ (8450-11449 RP) - 1,000 RP × 4 = 4,000 RP
      const tierPoints = totalPoints - 8450
      const maxTierPoints = 1000
      const divisionIndex = Math.min(Math.floor(tierPoints / 1000), 3)
      const divisions = ['IV', 'III', 'II', 'I']
      const division = divisions[3 - divisionIndex]
      const actualTierPoints = tierPoints % 1000
      
      return {
        name: `プラチナ ${division}`,
        color: 'text-cyan-400',
        icon: '🔷',
        minPoints: 8450,
        maxPoints: 1000,
        tierPoints: actualTierPoints,
        progress: actualTierPoints / 1000,
        pointsToNext: 1000 - actualTierPoints,
        isTopRank: false,
        totalPoints: totalPoints,
        division: division
      }
    } else if (totalPoints < 15000) {
      // ダイヤモンド (11450-14999 RP) - 1,200 RP × 4 = 4,800 RP
      const tierPoints = totalPoints - 11450
      const maxTierPoints = 1200
      const divisionIndex = Math.min(Math.floor(tierPoints / 1200), 3)
      const divisions = ['IV', 'III', 'II', 'I']
      const division = divisions[3 - divisionIndex]
      const actualTierPoints = tierPoints % 1200
      
      return {
        name: `ダイヤモンド ${division}`,
        color: 'text-purple-400',
        icon: '💎',
        minPoints: 11450,
        maxPoints: 1200,
        tierPoints: actualTierPoints,
        progress: actualTierPoints / 1200,
        pointsToNext: 1200 - actualTierPoints,
        isTopRank: false,
        totalPoints: totalPoints,
        division: division
      }
    } else if (totalPoints >= 15000 && totalPoints < 20000) {
      // マスター (15000-19999 RP) - ランキング制
      return {
        name: 'マスター',
        color: 'text-red-500',
        icon: '👑',
        minPoints: 15000,
        maxPoints: 999999,
        tierPoints: totalPoints - 15000,
        progress: 1,
        pointsToNext: 0,
        isTopRank: false,
        totalPoints: totalPoints
      }
    } else {
      // プレデター (20000+ RP) - ランキング制
      return {
        name: 'プレデター',
        color: 'text-red-600',
        icon: '🔥',
        minPoints: 20000,
        maxPoints: 999999,
        tierPoints: totalPoints - 20000,
        progress: 1,
        pointsToNext: 0,
        isTopRank: true,
        totalPoints: totalPoints
      }
    }
  }
  
  // ランキング制ランクの処理
  for (let i = ranks.length - 1; i >= 0; i--) {
    const rank = ranks[i]
    
    if (rank.isRankingBased) {
      // ランキング制ランク（マスター、プレデターなど）
      if (totalPoints >= thresholds[i] || i === ranks.length - 1) {
        return {
          name: rank.name,
          color: rank.color,
          icon: rank.icon,
          minPoints: thresholds[i] || 0,
          maxPoints: rank.maxPoints,
          tierPoints: totalPoints,
          progress: 1,
          pointsToNext: 0,
          isTopRank: i === ranks.length - 1,
          totalPoints: totalPoints
        }
      }
    } else {
      // 通常ランクの処理
      if (totalPoints >= thresholds[i] && (i === ranks.length - 1 || totalPoints < thresholds[i + 1])) {
        const rankStartPoints = thresholds[i] || 0
        const rankPoints = totalPoints - rankStartPoints
        
        // 特殊なシルバーI処理（Apexの場合）
        let maxTierPoints = rank.maxPoints
        let tierPoints = rankPoints % maxTierPoints
        let division = ''
        
        if (rank.divisions.length > 0) {
          const divisionSize = Math.floor(rank.maxPoints / rank.divisions.length)
          const divisionIndex = Math.min(
            Math.floor(rankPoints / divisionSize),
            rank.divisions.length - 1
          )
          division = rank.divisions[rank.divisions.length - 1 - divisionIndex]
          tierPoints = rankPoints % divisionSize
          
          // ApexシルバーIの特殊処理
          if (gameId === 'apex-legends' && rank.name === 'シルバー' && division === 'I') {
            maxTierPoints = rank.specialMaxRP?.['I'] || 750
            const silverPointsBeforeI = 1500 // シルバーIV→IIの合計RP
            tierPoints = totalPoints - (rankStartPoints + silverPointsBeforeI)
          }
        }
        
        const progress = maxTierPoints > 0 ? tierPoints / maxTierPoints : 0
        const pointsToNext = maxTierPoints - tierPoints
        
        console.log(`判定結果: ${rank.name}${division ? ' ' + division : ''} (${tierPoints}/${maxTierPoints})`)
        
        return {
          name: rank.name + (division ? ' ' + division : ''),
          color: rank.color,
          icon: rank.icon,
          minPoints: rankStartPoints,
          maxPoints: maxTierPoints,
          tierPoints: tierPoints,
          progress: progress,
          pointsToNext: pointsToNext,
          isTopRank: i === ranks.length - 1,
          totalPoints: totalPoints,
          division: division
        }
      }
    }
  }
  
  // デフォルト（最低ランク）
  const defaultRank = ranks[0]
  return {
    name: defaultRank.name + ' ' + (defaultRank.divisions[defaultRank.divisions.length - 1] || ''),
    color: defaultRank.color,
    icon: defaultRank.icon,
    minPoints: 0,
    maxPoints: defaultRank.maxPoints,
    tierPoints: totalPoints,
    progress: totalPoints / defaultRank.maxPoints,
    pointsToNext: defaultRank.maxPoints - totalPoints,
    isTopRank: false,
    totalPoints: totalPoints
  }
}

/**
 * ゲーム別の目標ラインを取得
 * @param gameId ゲームID
 * @param goalRP 目標RP
 * @returns 目標ライン配列
 */
export function getGameGoalLines(gameId: string, goalRP: number) {
  const system = getGameRankSystem(gameId)
  const ranks = system.ranks
  
  const lines = ranks.slice(0, -1).map((rank, index) => {
    const threshold = system.thresholds[index + 1]
    return {
      rp: threshold,
      label: rank.name,
      color: rank.color.replace('text-', '#').replace('500', '#eab308').replace('400', '#6b7280').replace('700', '#92400e').replace('600', '#dc2626')
    }
  })
  
  // ユーザー目標を追加
  lines.push({
    rp: goalRP,
    label: '目標',
    color: '#dc2626'
  })
  
  return lines
}

/**
 * ゲーム別の昇格予測を計算
 * @param gameId ゲームID
 * @param currentRP 現在のRP
 * @param averagePlacement 平均順位
 * @returns 昇格予測情報
 */
export function calculateGamePromotionPrediction(gameId: string, currentRP: number, averagePlacement: number) {
  const system = getGameRankSystem(gameId)
  const thresholds = system.thresholds
  const ranks = system.ranks
  
  // 次のランクを取得
  let targetRP = currentRP
  let targetRank = '現在のランク'
  
  for (let i = 0; i < thresholds.length; i++) {
    if (currentRP < thresholds[i]) {
      targetRP = thresholds[i]
      const rankIndex = i - 1
      if (rankIndex >= 0 && rankIndex < ranks.length) {
        targetRank = ranks[rankIndex].name
      }
      break
    }
  }
  
  // すでにトップランクの場合
  if (currentRP >= thresholds[thresholds.length - 1]) {
    const topRank = ranks[ranks.length - 1]
    return {
      currentRP,
      targetRP: currentRP + 1000,
      pointsNeeded: 1000,
      estimatedGames: Math.ceil(1000 / Math.max(10, 100 - averagePlacement * 2)),
      targetRank: topRank.name
    }
  }
  
  const pointsNeeded = targetRP - currentRP
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
