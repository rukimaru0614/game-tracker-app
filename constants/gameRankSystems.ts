// ゲーム別ランク体系のマスターデータ

export interface GameRankConfig {
  name: string
  maxPoints: number
  divisions: string[]
  specialMaxRP?: { [division: string]: number }
  color: string
  icon: string
  isRankingBased?: boolean
}

export interface GameRankSystem {
  [gameId: string]: {
    name: string
    pointUnit: string
    ranks: GameRankConfig[]
    thresholds: number[] // ラク境界のRP値
  }
}

// ゲーム別ランク体系の定義
export const GAME_RANK_SYSTEMS: GameRankSystem = {
  'apex-legends': {
    name: 'Apex Legends',
    pointUnit: 'RP',
    thresholds: [0, 1000, 3000, 5250, 8450, 11450, 15000, 20000],
    ranks: [
      {
        name: 'ルーキー',
        maxPoints: 250,
        divisions: ['IV', 'III', 'II', 'I'],
        color: 'text-stone-500',
        icon: '🌱'
      },
      {
        name: 'ブロンズ',
        maxPoints: 500,
        divisions: ['IV', 'III', 'II', 'I'],
        color: 'text-amber-700',
        icon: '🥉'
      },
      {
        name: 'シルバー',
        maxPoints: 500,
        divisions: ['IV', 'III', 'II', 'I'],
        specialMaxRP: { 'I': 750 },
        color: 'text-gray-400',
        icon: '🥈'
      },
      {
        name: 'ゴールド',
        maxPoints: 800,
        divisions: ['IV', 'III', 'II', 'I'],
        color: 'text-yellow-500',
        icon: '🏅'
      },
      {
        name: 'プラチナ',
        maxPoints: 1000,
        divisions: ['IV', 'III', 'II', 'I'],
        color: 'text-cyan-400',
        icon: '🔷'
      },
      {
        name: 'ダイヤモンド',
        maxPoints: 1200,
        divisions: ['IV', 'III', 'II', 'I'],
        color: 'text-purple-400',
        icon: '💎'
      },
      {
        name: 'マスター',
        maxPoints: 999999,
        divisions: [],
        color: 'text-red-500',
        icon: '👑',
        isRankingBased: true
      },
      {
        name: 'プレデター',
        maxPoints: 999999,
        divisions: [],
        color: 'text-red-600',
        icon: '🔥',
        isRankingBased: true
      }
    ]
  },

  'street-fighter-6': {
    name: 'Street Fighter 6',
    pointUnit: 'LP',
    thresholds: [0, 1000, 2000, 3000, 4000, 5000, 7000, 10000, 15000, 20000, 30000, 50000],
    ranks: [
      {
        name: 'アイアン',
        maxPoints: 99999,
        divisions: ['V', 'IV', 'III', 'II', 'I'],
        color: 'text-gray-600',
        icon: '🔧'
      },
      {
        name: 'ブロンズ',
        maxPoints: 99999,
        divisions: ['V', 'IV', 'III', 'II', 'I'],
        color: 'text-amber-700',
        icon: '🥉'
      },
      {
        name: 'シルバー',
        maxPoints: 99999,
        divisions: ['V', 'IV', 'III', 'II', 'I'],
        color: 'text-gray-400',
        icon: '🥈'
      },
      {
        name: 'ゴールド',
        maxPoints: 99999,
        divisions: ['V', 'IV', 'III', 'II', 'I'],
        color: 'text-yellow-500',
        icon: '🏅'
      },
      {
        name: 'プラチナ',
        maxPoints: 99999,
        divisions: ['V', 'IV', 'III', 'II', 'I'],
        color: 'text-cyan-400',
        icon: '🔷'
      },
      {
        name: 'ダイアモンド',
        maxPoints: 99999,
        divisions: ['V', 'IV', 'III', 'II', 'I'],
        color: 'text-purple-400',
        icon: '💎'
      },
      {
        name: 'マスター',
        maxPoints: 999999,
        divisions: [],
        color: 'text-red-500',
        icon: '👑'
      },
      {
        name: 'レジェンド',
        maxPoints: 999999,
        divisions: [],
        color: 'text-red-600',
        icon: '🔥',
        isRankingBased: true
      }
    ]
  },

  'league-of-legends': {
    name: 'League of Legends',
    pointUnit: 'LP',
    thresholds: [0, 400, 800, 1200, 1600, 2000, 2400, 2800, 3200, 3600],
    ranks: [
      {
        name: 'アイアン',
        maxPoints: 100,
        divisions: ['IV', 'III', 'II', 'I'],
        color: 'text-gray-600',
        icon: '🔧'
      },
      {
        name: 'ブロンズ',
        maxPoints: 100,
        divisions: ['IV', 'III', 'II', 'I'],
        color: 'text-amber-700',
        icon: '🥉'
      },
      {
        name: 'シルバー',
        maxPoints: 100,
        divisions: ['IV', 'III', 'II', 'I'],
        color: 'text-gray-400',
        icon: '🥈'
      },
      {
        name: 'ゴールド',
        maxPoints: 100,
        divisions: ['IV', 'III', 'II', 'I'],
        color: 'text-yellow-500',
        icon: '🏅'
      },
      {
        name: 'プラチナ',
        maxPoints: 100,
        divisions: ['IV', 'III', 'II', 'I'],
        color: 'text-cyan-400',
        icon: '🔷'
      },
      {
        name: 'ダイアモンド',
        maxPoints: 100,
        divisions: ['IV', 'III', 'II', 'I'],
        color: 'text-purple-400',
        icon: '💎'
      },
      {
        name: 'マスター',
        maxPoints: 999999,
        divisions: [],
        color: 'text-red-500',
        icon: '👑',
        isRankingBased: true
      },
      {
        name: 'グランドマスター',
        maxPoints: 999999,
        divisions: [],
        color: 'text-red-600',
        icon: '🔥',
        isRankingBased: true
      },
      {
        name: 'チャレンジャー',
        maxPoints: 999999,
        divisions: [],
        color: 'text-red-700',
        icon: '⚡',
        isRankingBased: true
      }
    ]
  },

  'valorant': {
    name: 'VALORANT',
    pointUnit: 'RR',
    thresholds: [0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400],
    ranks: [
      {
        name: 'アイアン',
        maxPoints: 100,
        divisions: ['I', 'II', 'III'],
        color: 'text-gray-600',
        icon: '🔧'
      },
      {
        name: 'ブロンズ',
        maxPoints: 100,
        divisions: ['I', 'II', 'III'],
        color: 'text-amber-700',
        icon: '🥉'
      },
      {
        name: 'シルバー',
        maxPoints: 100,
        divisions: ['I', 'II', 'III'],
        color: 'text-gray-400',
        icon: '🥈'
      },
      {
        name: 'ゴールド',
        maxPoints: 100,
        divisions: ['I', 'II', 'III'],
        color: 'text-yellow-500',
        icon: '🏅'
      },
      {
        name: 'プラチナ',
        maxPoints: 100,
        divisions: ['I', 'II', 'III'],
        color: 'text-cyan-400',
        icon: '🔷'
      },
      {
        name: 'ダイアモンド',
        maxPoints: 100,
        divisions: ['I', 'II', 'III'],
        color: 'text-purple-400',
        icon: '💎'
      },
      {
        name: 'イモータル',
        maxPoints: 100,
        divisions: ['I', 'II', 'III'],
        color: 'text-red-500',
        icon: '👑'
      },
      {
        name: 'レディアント',
        maxPoints: 999999,
        divisions: [],
        color: 'text-red-600',
        icon: '🔥',
        isRankingBased: true
      }
    ]
  }
}

// ゲーム別ランク体系を取得するヘルパー関数
export function getGameRankSystem(gameId: string) {
  return GAME_RANK_SYSTEMS[gameId] || GAME_RANK_SYSTEMS['apex-legends']
}

// ゲーム別のランクリストを取得
export function getGameRanks(gameId: string) {
  const system = getGameRankSystem(gameId)
  return system.ranks
}

// ゲーム別の有効なディビジョンを取得
export function getGameValidDivisions(gameId: string, rankName: string) {
  const ranks = getGameRanks(gameId)
  const rank = ranks.find(r => r.name === rankName)
  return rank ? rank.divisions : []
}

// ゲーム別のポイント単位を取得
export function getGamePointUnit(gameId: string) {
  const system = getGameRankSystem(gameId)
  return system.pointUnit
}
