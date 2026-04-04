export interface RankThreshold {
  name: string
  minPoints: number
  maxPoints?: number
  color: string
  icon?: string
}

export type RankTier = RankThreshold

export interface GameRankThresholds {
  [gameId: string]: RankThreshold[]
}

// Apex Legends RP thresholds (2025 season 20) - 新仕様に基づいて再定義
export const APEX_RANK_THRESHOLDS: RankThreshold[] = [
  { name: 'プレデター', minPoints: 50001, maxPoints: 999999, color: 'text-red-600', icon: '👹' },
  { name: 'マスター', minPoints: 10001, maxPoints: 49999, color: 'text-purple-500', icon: '💜' },
  { name: 'ダイヤモンドI', minPoints: 14000, maxPoints: 14999, color: 'text-blue-500', icon: '💎' },
  { name: 'ダイヤモンドII', minPoints: 13000, maxPoints: 13999, color: 'text-blue-500', icon: '💎' },
  { name: 'ダイヤモンドIII', minPoints: 12000, maxPoints: 12999, color: 'text-blue-500', icon: '💎' },
  { name: 'ダイヤモンドIV', minPoints: 11000, maxPoints: 11999, color: 'text-blue-500', icon: '💎' },
  { name: 'プラチナI', minPoints: 10000, maxPoints: 10999, color: 'text-cyan-500', icon: '🔷' },
  { name: 'プラチナII', minPoints: 9000, maxPoints: 9999, color: 'text-cyan-500', icon: '🔷' },
  { name: 'プラチナIII', minPoints: 8000, maxPoints: 8999, color: 'text-cyan-500', icon: '🔷' },
  { name: 'プラチナIV', minPoints: 7000, maxPoints: 7999, color: 'text-cyan-500', icon: '🔷' },
  { name: 'ゴールドI', minPoints: 6000, maxPoints: 6999, color: 'text-yellow-500', icon: '🏅' },
  { name: 'ゴールドII', minPoints: 5000, maxPoints: 5999, color: 'text-yellow-500', icon: '🏅' },
  { name: 'ゴールドIII', minPoints: 4000, maxPoints: 4999, color: 'text-yellow-500', icon: '🏅' },
  { name: 'ゴールドIV', minPoints: 3000, maxPoints: 3999, color: 'text-yellow-500', icon: '🏅' },
  { name: 'シルバーI', minPoints: 2000, maxPoints: 2749, color: 'text-gray-400', icon: '🥈' }, // 特殊ケース: 750 RPまで（2000-2749）
  { name: 'シルバーII', minPoints: 1500, maxPoints: 1999, color: 'text-gray-400', icon: '🥈' },
  { name: 'シルバーIII', minPoints: 1000, maxPoints: 1499, color: 'text-gray-400', icon: '🥈' },
  { name: 'シルバーIV', minPoints: 500, maxPoints: 999, color: 'text-gray-400', icon: '🥈' },
  { name: 'ブロンズI', minPoints: 400, maxPoints: 499, color: 'text-amber-700', icon: '🥉' },
  { name: 'ブロンズII', minPoints: 300, maxPoints: 399, color: 'text-amber-700', icon: '🥉' },
  { name: 'ブロンズIII', minPoints: 200, maxPoints: 299, color: 'text-amber-700', icon: '🥉' },
  { name: 'ブロンズIV', minPoints: 100, maxPoints: 199, color: 'text-amber-700', icon: '🥉' },
  { name: 'ルーキーI', minPoints: 0, maxPoints: 99, color: 'text-stone-500', icon: '🌱' },
  { name: 'ルーキーII', minPoints: -250, maxPoints: -1, color: 'text-stone-500', icon: '🌱' },
  { name: 'ルーキーIII', minPoints: -500, maxPoints: -251, color: 'text-stone-500', icon: '🌱' },
  { name: 'ルーキーIV', minPoints: -750, maxPoints: -501, color: 'text-stone-500', icon: '🌱' }
]

// Valorant RR thresholds (2025 season 9) - 最新公式データ
export const VALORANT_RANK_THRESHOLDS: RankThreshold[] = [
  { name: 'ラディアント', minPoints: 3000, maxPoints: 9999, color: 'text-red-600', icon: '⭐' },
  { name: 'イモータル3', minPoints: 2800, maxPoints: 2999, color: 'text-red-500', icon: '🔴' },
  { name: 'イモータル2', minPoints: 2600, maxPoints: 2799, color: 'text-red-500', icon: '🔴' },
  { name: 'イモータル1', minPoints: 2400, maxPoints: 2599, color: 'text-red-500', icon: '🔴' },
  { name: 'アセンダント3', minPoints: 2200, maxPoints: 2399, color: 'text-orange-500', icon: '🟠' },
  { name: 'アセンダント2', minPoints: 2000, maxPoints: 2199, color: 'text-orange-500', icon: '🟠' },
  { name: 'アセンダント1', minPoints: 1800, maxPoints: 1999, color: 'text-orange-500', icon: '🟠' },
  { name: 'ダイヤモンド3', minPoints: 1600, maxPoints: 1799, color: 'text-blue-500', icon: '💎' },
  { name: 'ダイヤモンド2', minPoints: 1400, maxPoints: 1599, color: 'text-blue-500', icon: '💎' },
  { name: 'ダイヤモンド1', minPoints: 1200, maxPoints: 1399, color: 'text-blue-500', icon: '💎' },
  { name: 'プラチナ3', minPoints: 1000, maxPoints: 1199, color: 'text-cyan-500', icon: '🔷' },
  { name: 'プラチナ2', minPoints: 800, maxPoints: 999, color: 'text-cyan-500', icon: '🔷' },
  { name: 'プラチナ1', minPoints: 600, maxPoints: 799, color: 'text-cyan-500', icon: '🔷' },
  { name: 'ゴールド3', minPoints: 450, maxPoints: 599, color: 'text-yellow-500', icon: '🏅' },
  { name: 'ゴールド2', minPoints: 300, maxPoints: 449, color: 'text-yellow-500', icon: '🏅' },
  { name: 'ゴールド1', minPoints: 150, maxPoints: 299, color: 'text-yellow-500', icon: '🏅' },
  { name: 'シルバー3', minPoints: 50, maxPoints: 149, color: 'text-gray-400', icon: '🥈' },
  { name: 'シルバー2', minPoints: 25, maxPoints: 49, color: 'text-gray-400', icon: '🥈' },
  { name: 'シルバー1', minPoints: 10, maxPoints: 24, color: 'text-gray-400', icon: '🥈' },
  { name: 'ブロンズ3', minPoints: 0, maxPoints: 9, color: 'text-amber-700', icon: '🥉' }
]

// League of Legends LP thresholds (2025 season 14) - 最新公式データ
export const LOL_RANK_THRESHOLDS: RankThreshold[] = [
  { name: 'チャレンジャー', minPoints: 2800, maxPoints: 9999, color: 'text-red-600', icon: '👑' },
  { name: 'グランドマスター', minPoints: 2600, maxPoints: 2799, color: 'text-purple-600', icon: '💜' },
  { name: 'マスター', minPoints: 2400, maxPoints: 2599, color: 'text-purple-500', icon: '💜' },
  { name: 'ダイヤモンド', minPoints: 2000, maxPoints: 2399, color: 'text-blue-500', icon: '💎' },
  { name: 'エメラルド', minPoints: 1600, maxPoints: 1999, color: 'text-green-500', icon: '💚' },
  { name: 'プラチナ', minPoints: 1200, maxPoints: 1599, color: 'text-cyan-500', icon: '🔷' },
  { name: 'ゴールド', minPoints: 800, maxPoints: 1199, color: 'text-yellow-500', icon: '🏅' },
  { name: 'シルバー', minPoints: 400, maxPoints: 799, color: 'text-gray-400', icon: '🥈' },
  { name: 'ブロンズ', minPoints: 0, maxPoints: 399, color: 'text-amber-700', icon: '🥉' }
]

// Street Fighter 6 LP thresholds (2024)
export const SF6_RANK_THRESHOLDS: RankThreshold[] = [
  { name: 'レジェンド', minPoints: 20000, color: 'text-red-500', icon: '👑' },
  { name: 'マスター', minPoints: 10001, maxPoints: 49999, color: 'text-purple-500', icon: '💜' },
  { name: 'ダイヤモンド', minPoints: 10000, maxPoints: 14999, color: 'text-blue-500', icon: '💎' },
  { name: 'プラチナ', minPoints: 6000, maxPoints: 9999, color: 'text-cyan-500', icon: '🔷' },
  { name: 'ゴールド', minPoints: 3000, maxPoints: 5999, color: 'text-yellow-500', icon: '🏅' },
  { name: 'シルバー', minPoints: 1500, maxPoints: 2999, color: 'text-gray-400', icon: '🥈' },
  { name: 'ブロンズ', minPoints: 500, maxPoints: 1499, color: 'text-amber-700', icon: '🥉' },
  { name: 'アイアン', minPoints: 0, maxPoints: 499, color: 'text-stone-500', icon: '⚔️' }
]

// Default thresholds for custom games
export const DEFAULT_RANK_THRESHOLDS: RankThreshold[] = [
  { name: 'マスター', minPoints: 10001, maxPoints: 49999, color: 'text-purple-500', icon: '💜' },
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
