'use client'

import { useState, useEffect } from 'react'
import { Game, GameRecord, GameData, RankTier } from '@/types/game'

const DEFAULT_APEX_RANKS: RankTier[] = [
  { name: 'マスター', minPoints: 15000, color: 'text-purple-500' },
  { name: 'ダイヤモンド', minPoints: 11400, color: 'text-blue-500' },
  { name: 'プラチナ', minPoints: 8200, color: 'text-cyan-500' },
  { name: 'ゴールド', minPoints: 5400, color: 'text-yellow-500' },
  { name: 'シルバー', minPoints: 3000, color: 'text-gray-400' },
  { name: 'ブロンズ', minPoints: 1000, color: 'text-amber-700' },
  { name: 'ルーキー', minPoints: 0, color: 'text-stone-500' }
]

const DEFAULT_VALORANT_RANKS: RankTier[] = [
  { name: 'イモータル', minPoints: 2100, color: 'text-red-500' },
  { name: 'アセンダント', minPoints: 1800, color: 'text-orange-500' },
  { name: 'ダイヤモンド', minPoints: 1500, color: 'text-blue-500' },
  { name: 'プラチナ', minPoints: 1200, color: 'text-cyan-500' },
  { name: 'ゴールド', minPoints: 900, color: 'text-yellow-500' },
  { name: 'シルバー', minPoints: 600, color: 'text-gray-400' },
  { name: 'ブロンズ', minPoints: 300, color: 'text-amber-700' },
  { name: 'アイアン', minPoints: 0, color: 'text-stone-500' }
]

const DEFAULT_LOL_RANKS: RankTier[] = [
  { name: 'ダイヤモンド', minPoints: 2400, color: 'text-blue-500' },
  { name: 'エメラルド', minPoints: 2000, color: 'text-green-500' },
  { name: 'プラチナ', minPoints: 1600, color: 'text-cyan-500' },
  { name: 'ゴールド', minPoints: 1200, color: 'text-yellow-500' },
  { name: 'シルバー', minPoints: 800, color: 'text-gray-400' },
  { name: 'ブロンズ', minPoints: 400, color: 'text-amber-700' },
  { name: 'アイアン', minPoints: 0, color: 'text-stone-500' }
]

const DEFAULT_SF6_RANKS: RankTier[] = [
  { name: 'レジェンド', minPoints: 20000, color: 'text-red-500', icon: '👑' },
  { name: 'マスター', minPoints: 15000, color: 'text-purple-500', icon: '💜' },
  { name: 'ダイヤモンド', minPoints: 10000, color: 'text-blue-500', icon: '💎' },
  { name: 'プラチナ', minPoints: 6000, color: 'text-cyan-500', icon: '🔷' },
  { name: 'ゴールド', minPoints: 3000, color: 'text-yellow-500', icon: '🏅' },
  { name: 'シルバー', minPoints: 1500, color: 'text-gray-400', icon: '🥈' },
  { name: 'ブロンズ', minPoints: 500, color: 'text-amber-700', icon: '🥉' },
  { name: 'アイアン', minPoints: 0, color: 'text-stone-500', icon: '⚔️' }
]

const DEFAULT_APEX_GAME: Game = {
  id: 'apex-legends',
  name: 'Apex Legends',
  pointUnit: 'RP',
  themeColor: '#ef4444',
  rankTiers: DEFAULT_APEX_RANKS,
  createdAt: Date.now()
}

const DEFAULT_VALORANT_GAME: Game = {
  id: 'valorant',
  name: 'Valorant',
  pointUnit: 'RR',
  themeColor: '#8b5cf6',
  rankTiers: DEFAULT_VALORANT_RANKS,
  createdAt: Date.now()
}

const DEFAULT_LOL_GAME: Game = {
  id: 'league-of-legends',
  name: 'League of Legends',
  pointUnit: 'LP',
  themeColor: '#10b981',
  rankTiers: DEFAULT_LOL_RANKS,
  createdAt: Date.now()
}

const DEFAULT_SF6_GAME: Game = {
  id: 'street-fighter-6',
  name: 'Street Fighter 6',
  pointUnit: 'LP',
  themeColor: '#f97316',
  rankTiers: DEFAULT_SF6_RANKS,
  createdAt: Date.now()
}

const DEFAULT_GAMES: Game[] = [
  DEFAULT_APEX_GAME,
  DEFAULT_VALORANT_GAME,
  DEFAULT_LOL_GAME,
  DEFAULT_SF6_GAME
]

export function useGameData() {
  const [gameData, setGameData] = useState<GameData>({
    games: DEFAULT_GAMES,
    records: [],
    selectedGameId: 'apex-legends'
  })

  useEffect(() => {
    // 既存のApexデータを移行
    const existingRecords = localStorage.getItem('apex-rp-records')
    const savedGameData = localStorage.getItem('game-tracker-data')
    
    if (savedGameData) {
      const parsed = JSON.parse(savedGameData)
      // すべてのpointsフィールドを数値に変換
      const sanitizedData = {
        ...parsed,
        records: parsed.records.map((record: any) => ({
          ...record,
          points: Number(record.points) || 0
        }))
      }
      setGameData(sanitizedData)
    } else if (existingRecords) {
      // 既存データを新しい形式に移行
      const oldRecords = JSON.parse(existingRecords)
      const migratedRecords: GameRecord[] = oldRecords.map((record: any) => ({
        ...record,
        gameId: 'apex-legends',
        points: Number(record.rp) || 0 // 確実に数値に変換
      }))
      
      setGameData(prev => ({
        ...prev,
        records: migratedRecords
      }))
      
      // 新しい形式で保存
      const newGameData = {
        games: DEFAULT_GAMES,
        records: migratedRecords,
        selectedGameId: 'apex-legends'
      }
      localStorage.setItem('game-tracker-data', JSON.stringify(newGameData))
    }
  }, [])

  const saveGameData = (newData: GameData) => {
    setGameData(newData)
    localStorage.setItem('game-tracker-data', JSON.stringify(newData))
  }

  const selectedGame = gameData.games.find(g => g.id === gameData.selectedGameId) || DEFAULT_GAMES[0]
  const gameRecords = gameData.records.filter(r => r.gameId === gameData.selectedGameId)

  const addGame = (game: Omit<Game, 'id' | 'createdAt'>) => {
    const newGame: Game = {
      ...game,
      id: Date.now().toString(),
      createdAt: Date.now()
    }
    
    const newData = {
      ...gameData,
      games: [...gameData.games, newGame]
    }
    saveGameData(newData)
    return newGame
  }

  const removeGame = (gameId: string) => {
    if (gameId === 'apex-legends') return // Apexは削除不可
    
    const newData = {
      ...gameData,
      games: gameData.games.filter(g => g.id !== gameId),
      records: gameData.records.filter(r => r.gameId !== gameId),
      selectedGameId: gameData.selectedGameId === gameId ? 'apex-legends' : gameData.selectedGameId
    }
    saveGameData(newData)
  }

  const selectGame = (gameId: string) => {
    const newData = {
      ...gameData,
      selectedGameId: gameId
    }
    saveGameData(newData)
  }

  const addRecord = (record: Omit<GameRecord, 'id' | 'gameId' | 'timestamp'>) => {
    const newRecord: GameRecord = {
      ...record,
      id: Date.now().toString(),
      gameId: gameData.selectedGameId,
      timestamp: new Date(record.date + ' ' + record.time).getTime()
    }
    
    const newData = {
      ...gameData,
      records: [...gameData.records, newRecord].sort((a, b) => a.timestamp - b.timestamp)
    }
    saveGameData(newData)
    return newRecord
  }

  const deleteRecord = (recordId: string) => {
    const newData = {
      ...gameData,
      records: gameData.records.filter(r => r.id !== recordId)
    }
    saveGameData(newData)
  }

  const updateGame = (gameId: string, updates: Partial<Game>) => {
    const newData = {
      ...gameData,
      games: gameData.games.map(g => 
        g.id === gameId ? { ...g, ...updates } : g
      )
    }
    saveGameData(newData)
  }

  return {
    gameData,
    selectedGame,
    gameRecords,
    allGames: gameData.games,
    addGame,
    removeGame,
    selectGame,
    addRecord,
    deleteRecord,
    updateGame
  }
}
