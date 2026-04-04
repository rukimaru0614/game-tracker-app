// Rank thresholds utility functions
import { type Game } from '@/types/game'

export interface RankThreshold {
  name: string
  minPoints: number
  maxPoints: number
  color: string
  icon: string
}

export const getGameRankThresholds = (gameId: string): RankThreshold[] => {
  // Default thresholds - can be customized per game
  return [
    { name: 'ルーキーIV', minPoints: 0, maxPoints: 249, color: 'text-stone-500', icon: '🌱' },
    { name: 'ルーキーIII', minPoints: 250, maxPoints: 499, color: 'text-stone-500', icon: '🌱' },
    { name: 'ルーキーII', minPoints: 500, maxPoints: 749, color: 'text-stone-500', icon: '🌱' },
    { name: 'ルーキーI', minPoints: 750, maxPoints: 999, color: 'text-stone-500', icon: '🌱' },
    { name: 'ブロンズIV', minPoints: 1000, maxPoints: 1499, color: 'text-orange-600', icon: '🥉' },
    { name: 'ブロンズIII', minPoints: 1500, maxPoints: 1999, color: 'text-orange-600', icon: '🥉' },
    { name: 'ブロンズII', minPoints: 2000, maxPoints: 2499, color: 'text-orange-600', icon: '🥉' },
    { name: 'ブロンズI', minPoints: 2500, maxPoints: 2999, color: 'text-orange-600', icon: '🥉' },
    { name: 'シルバーIV', minPoints: 3000, maxPoints: 3499, color: 'text-gray-400', icon: '🥈' },
    { name: 'シルバーIII', minPoints: 3500, maxPoints: 3999, color: 'text-gray-400', icon: '🥈' },
    { name: 'シルバーII', minPoints: 4000, maxPoints: 4499, color: 'text-gray-400', icon: '🥈' },
    { name: 'シルバーI', minPoints: 4500, maxPoints: 4799, color: 'text-gray-400', icon: '🥈' },
    { name: 'ゴールドIV', minPoints: 4800, maxPoints: 5299, color: 'text-yellow-500', icon: '🥇' },
    { name: 'ゴールドIII', minPoints: 5300, maxPoints: 5799, color: 'text-yellow-500', icon: '🥇' },
    { name: 'ゴールドII', minPoints: 5800, maxPoints: 6299, color: 'text-yellow-500', icon: '🥇' },
    { name: 'ゴールドI', minPoints: 6300, maxPoints: 6799, color: 'text-yellow-500', icon: '🥇' },
    { name: 'プラチナIV', minPoints: 6800, maxPoints: 7299, color: 'text-blue-400', icon: '🥈' },
    { name: 'プラチナIII', minPoints: 7300, maxPoints: 7799, color: 'text-blue-400', icon: '🥈' },
    { name: 'プラチナII', minPoints: 7800, maxPoints: 8299, color: 'text-blue-400', icon: '🥈' },
    { name: 'プラチナI', minPoints: 8300, maxPoints: 8799, color: 'text-blue-400', icon: '🥈' },
    { name: 'ダイヤモンドIV', minPoints: 8800, maxPoints: 9299, color: 'text-purple-500', icon: '💎' },
    { name: 'ダイヤモンドIII', minPoints: 9300, maxPoints: 9799, color: 'text-purple-500', icon: '💎' },
    { name: 'ダイヤモンドII', minPoints: 9800, maxPoints: 10299, color: 'text-purple-500', icon: '💎' },
    { name: 'ダイヤモンドI', minPoints: 10300, maxPoints: 10799, color: 'text-purple-500', icon: '💎' },
    { name: 'マスター', minPoints: 10800, maxPoints: 14999, color: 'text-purple-500', icon: '👑' },
    { name: 'プレデター', minPoints: 15000, maxPoints: 99999, color: 'text-red-600', icon: '👹' }
  ]
}
