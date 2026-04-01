export interface RankThreshold {
  name: string
  minPoints: number
  maxPoints?: number
  color: string
  icon?: string
}

export interface GameRankThresholds {
  [gameId: string]: RankThreshold[]
}

// Apex Legends RP thresholds (2024 season) - Corrected values
export const APEX_RANK_THRESHOLDS: RankThreshold[] = [
  { name: 'マスター', minPoints: 15000, color: 'text-purple-500', icon: '💜' },
  { name: 'ダイヤモンド', minPoints: 11400, maxPoints: 14999, color: 'text-blue-500', icon: '💎' },
  { name: 'プラチナ', minPoints: 8200, maxPoints: 11399, color: 'text-cyan-500', icon: '🔷' },
  { name: 'ゴールド', minPoints: 5400, maxPoints: 8199, color: 'text-yellow-500', icon: '🏅' },
  { name: 'シルバー', minPoints: 3000, maxPoints: 5399, color: 'text-gray-400', icon: '🥈' },
  { name: 'ブロンズ', minPoints: 1000, maxPoints: 2999, color: 'text-amber-700', icon: '🥉' },
  { name: 'ルーキー', minPoints: 0, maxPoints: 999, color: 'text-stone-500', icon: '🌱' }
]

// Valorant RR thresholds (2024) - Corrected values
export const VALORANT_RANK_THRESHOLDS: RankThreshold[] = [
  { name: 'イモータル', minPoints: 2100, color: 'text-red-500', icon: '🔴' },
  { name: 'アセンダント', minPoints: 1800, maxPoints: 2099, color: 'text-orange-500', icon: '�' },
  { name: 'ダイヤモンド', minPoints: 1500, maxPoints: 1799, color: 'text-blue-500', icon: '💎' },
  { name: 'プラチナ', minPoints: 1200, maxPoints: 1499, color: 'text-cyan-500', icon: '🔷' },
  { name: 'ゴールド', minPoints: 900, maxPoints: 1199, color: 'text-yellow-500', icon: '🏅' },
  { name: 'シルバー', minPoints: 600, maxPoints: 899, color: 'text-gray-400', icon: '🥈' },
  { name: 'ブロンズ', minPoints: 300, maxPoints: 599, color: 'text-amber-700', icon: '🥉' },
  { name: 'アイアン', minPoints: 0, maxPoints: 299, color: 'text-stone-500', icon: '⚔️' }
]

// League of Legends LP thresholds (2024) - Corrected values
export const LOL_RANK_THRESHOLDS: RankThreshold[] = [
  { name: 'ダイヤモンド', minPoints: 2400, color: 'text-blue-500', icon: '💎' },
  { name: 'エメラルド', minPoints: 2000, maxPoints: 2399, color: 'text-green-500', icon: '💚' },
  { name: 'プラチナ', minPoints: 1600, maxPoints: 1999, color: 'text-cyan-500', icon: '🔷' },
  { name: 'ゴールド', minPoints: 1200, maxPoints: 1599, color: 'text-yellow-500', icon: '🏅' },
  { name: 'シルバー', minPoints: 800, maxPoints: 1199, color: 'text-gray-400', icon: '🥈' },
  { name: 'ブロンズ', minPoints: 400, maxPoints: 799, color: 'text-amber-700', icon: '🥉' },
  { name: 'アイアン', minPoints: 0, maxPoints: 399, color: 'text-stone-500', icon: '⚔️' }
]

// Street Fighter 6 LP thresholds (2024)
export const SF6_RANK_THRESHOLDS: RankThreshold[] = [
  { name: 'レジェンド', minPoints: 20000, color: 'text-red-500', icon: '👑' },
  { name: 'マスター', minPoints: 15000, maxPoints: 19999, color: 'text-purple-500', icon: '💜' },
  { name: 'ダイヤモンド', minPoints: 10000, maxPoints: 14999, color: 'text-blue-500', icon: '💎' },
  { name: 'プラチナ', minPoints: 6000, maxPoints: 9999, color: 'text-cyan-500', icon: '🔷' },
  { name: 'ゴールド', minPoints: 3000, maxPoints: 5999, color: 'text-yellow-500', icon: '🏅' },
  { name: 'シルバー', minPoints: 1500, maxPoints: 2999, color: 'text-gray-400', icon: '🥈' },
  { name: 'ブロンズ', minPoints: 500, maxPoints: 1499, color: 'text-amber-700', icon: '🥉' },
  { name: 'アイアン', minPoints: 0, maxPoints: 499, color: 'text-stone-500', icon: '⚔️' }
]

// Default thresholds for custom games
export const DEFAULT_RANK_THRESHOLDS: RankThreshold[] = [
  { name: 'S', minPoints: 1000, color: 'text-red-500', icon: '🌟' },
  { name: 'A', minPoints: 800, maxPoints: 999, color: 'text-purple-500', icon: '⭐' },
  { name: 'B', minPoints: 600, maxPoints: 799, color: 'text-blue-500', icon: '✨' },
  { name: 'C', minPoints: 400, maxPoints: 599, color: 'text-yellow-500', icon: '📍' },
  { name: 'D', minPoints: 200, maxPoints: 399, color: 'text-gray-400', icon: '📍' },
  { name: 'F', minPoints: 0, maxPoints: 199, color: 'text-stone-500', icon: '📍' }
]

// Game-specific thresholds mapping
export const GAME_RANK_THRESHOLDS: GameRankThresholds = {
  'apex-legends': APEX_RANK_THRESHOLDS,
  'valorant': VALORANT_RANK_THRESHOLDS,
  'league-of-legends': LOL_RANK_THRESHOLDS,
  'street-fighter-6': SF6_RANK_THRESHOLDS
}

// Helper function to get thresholds for a game
export function getRankThresholds(gameName: string): RankThreshold[] {
  const normalizedGameName = gameName.toLowerCase()
  
  // Check for exact matches first
  if (normalizedGameName.includes('apex')) {
    return APEX_RANK_THRESHOLDS
  }
  if (normalizedGameName.includes('valorant') || normalizedGameName.includes('valo')) {
    return VALORANT_RANK_THRESHOLDS
  }
  if (normalizedGameName.includes('league') || normalizedGameName.includes('lol')) {
    return LOL_RANK_THRESHOLDS
  }
  if (normalizedGameName.includes('street') || normalizedGameName.includes('sf6') || normalizedGameName.includes('fighter')) {
    return SF6_RANK_THRESHOLDS
  }
  
  // Return default thresholds for custom games
  return DEFAULT_RANK_THRESHOLDS
}
