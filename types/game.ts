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
  rp: number // 累計RP
  tierPoints: number // ティア内RP
  currentTier: string // 現在のランク名
  division?: string // ディビジョン
  rankingPosition?: number // ランキング制ランクの順位
  memo: string
  matches?: number
  bestPlacement?: number
}

export interface GameData {
  games: Game[]
  records: GameRecord[]
  selectedGameId: string
}
