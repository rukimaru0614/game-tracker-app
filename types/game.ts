export interface Game {
  id: string
  name: string
  pointUnit: string
  themeColor: string
  rankTiers: RankTier[]
  createdAt: number
}

export interface RankTier {
  name: string
  minPoints: number
  maxPoints?: number
  color: string
  icon?: string
}

export interface GameRecord {
  id: string
  gameId: string
  date: string
  time: string
  timestamp: number
  points: number // 累計RP
  tierPoints: number // ティア内RP
  currentTier: string // 現在のランク名
  memo: string
  matches?: number
  bestPlacement?: number
}

export interface GameData {
  games: Game[]
  records: GameRecord[]
  selectedGameId: string
}
