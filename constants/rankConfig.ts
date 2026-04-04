export interface RankConfig {
  name: string
  maxRP: number // ディビジョンごとの最大RP（上限）
  divisions: number
  specialMaxRP?: number // 特殊な上限（シルバーI→ゴールドIVなど）
  isRankingBased?: boolean // マスター/プレデターなどランキング制
  color: string
  icon: string
}

export const RANK_DATA: { [key: string]: RankConfig } = {
  ROOKIE: {
    name: 'ルーキー',
    maxRP: 250,
    divisions: 4,
    color: 'text-stone-500',
    icon: '🌱'
  },
  BRONZE: {
    name: 'ブロンズ',
    maxRP: 500,
    divisions: 4,
    color: 'text-amber-700',
    icon: '🥉'
  },
  SILVER: {
    name: 'シルバー',
    maxRP: 500,
    divisions: 4,
    specialMaxRP: 750, // シルバーIからゴールドIVへの昇格のみ750RP
    color: 'text-gray-400',
    icon: '🥈'
  },
  GOLD: {
    name: 'ゴールド',
    maxRP: 750,
    divisions: 4,
    color: 'text-yellow-500',
    icon: '🏅'
  },
  PLATINUM: {
    name: 'プラチナ',
    maxRP: 800, // 800〜900のうち下限値を採用
    divisions: 4,
    color: 'text-cyan-500',
    icon: '🔷'
  },
  DIAMOND: {
    name: 'ダイヤモンド',
    maxRP: 1000,
    divisions: 4,
    color: 'text-blue-500',
    icon: '💎'
  },
  MASTER: {
    name: 'マスター',
    maxRP: 0, // ランキング制なのでRP不要
    divisions: 0, // ディビジョンなし
    isRankingBased: true,
    color: 'text-purple-500',
    icon: '💜'
  },
  PREDATOR: {
    name: 'プレデター',
    maxRP: 0, // ランキング制なのでRP不要
    divisions: 0, // ディビジョンなし
    isRankingBased: true,
    color: 'text-red-600',
    icon: '👹'
  }
}

// ランクの順序（昇格順）
export const RANK_ORDER = [
  'ROOKIE',
  'BRONZE', 
  'SILVER',
  'GOLD',
  'PLATINUM',
  'DIAMOND',
  'MASTER',
  'PREDATOR'
]

// ディビジョンの順序（降格順：IV→III→II→I）
export const DIVISION_ORDER = ['IV', 'III', 'II', 'I']

// ヘルパー関数
export function getRankConfig(rankKey: string): RankConfig | null {
  return RANK_DATA[rankKey] || null
}

export function getNextRank(rankKey: string): string | null {
  const currentIndex = RANK_ORDER.indexOf(rankKey)
  return currentIndex < RANK_ORDER.length - 1 ? RANK_ORDER[currentIndex + 1] : null
}

export function getPreviousRank(rankKey: string): string | null {
  const currentIndex = RANK_ORDER.indexOf(rankKey)
  return currentIndex > 0 ? RANK_ORDER[currentIndex - 1] : null
}

export function getMaxRPForRank(rankKey: string, division?: string): number {
  const rank = getRankConfig(rankKey)
  if (!rank || rank.isRankingBased) return 0
  
  // シルバーIの特殊ケース
  if (rankKey === 'SILVER' && division === 'I' && rank.specialMaxRP) {
    return rank.specialMaxRP
  }
  
  return rank.maxRP
}

export function getRemainingRPForNextRank(
  currentRankKey: string, 
  currentDivision: string,
  currentTierPoints: number
): number {
  const maxRP = getMaxRPForRank(currentRankKey, currentDivision)
  if (maxRP === 0) return 0
  
  const remaining = maxRP - currentTierPoints
  return Math.max(0, remaining) // 負の値を防ぐ
}

export function getProgressPercentage(
  currentRankKey: string,
  currentDivision: string, 
  currentTierPoints: number
): number {
  const maxRP = getMaxRPForRank(currentRankKey, currentDivision)
  if (maxRP === 0) return 0
  
  return Math.min(currentTierPoints / maxRP, 1) // 100%を超えないように
}

export function getValidDivisions(rankKey: string): string[] {
  const rank = getRankConfig(rankKey)
  if (!rank || rank.isRankingBased) return []
  
  // ディビジョン数に基づいて有効なディビジョンを返す
  return DIVISION_ORDER.slice(0, rank.divisions)
}

export function isRankingBased(rankKey: string): boolean {
  const rank = getRankConfig(rankKey)
  return rank?.isRankingBased || false
}

// ランクとディビジョンから表示名を生成
export function getRankDisplayName(rankKey: string, division?: string): string {
  const rank = getRankConfig(rankKey)
  if (!rank) return ''
  
  if (rank.isRankingBased) {
    return rank.name
  }
  
  return division ? `${rank.name}${division}` : rank.name
}

// 累計RPを計算（特定のランク・ディビジョンに到達するために必要なRP）
export function calculateTotalRPForRank(rankKey: string, division?: string): number {
  let totalRP = 0
  
  for (let i = 0; i < RANK_ORDER.length; i++) {
    const currentRankKey = RANK_ORDER[i]
    const currentRank = getRankConfig(currentRankKey)
    
    if (!currentRank) continue
    
    // 目標のランクに到達したらループ終了
    if (currentRankKey === rankKey) {
      // ディビジョンがある場合は、そのディビジョンまでのRPを加算
      if (division && !currentRank.isRankingBased) {
        const validDivisions = getValidDivisions(currentRankKey)
        const divisionIndex = validDivisions.indexOf(division)
        if (divisionIndex > 0) {
          // 下位ディビジョンからのRPを加算（IV→III→II→Iの順）
          for (let j = 0; j < divisionIndex; j++) {
            totalRP += currentRank.maxRP
          }
        }
      }
      break
    }
    
    // ランク制でない場合のみRPを加算
    if (!currentRank.isRankingBased) {
      totalRP += currentRank.maxRP * currentRank.divisions
    }
  }
  
  return totalRP
}
