// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { Game, GameRecord, GameData } from '@/types/game'
import { RankTier } from '@/constants/rankThresholds'
import { APEX_RANK_THRESHOLDS, VALORANT_RANK_THRESHOLDS, LOL_RANK_THRESHOLDS, SF6_RANK_THRESHOLDS } from '@/constants/rankThresholds'

const DEFAULT_APEX_GAME: Game = {
  id: 'apex-legends',
  name: 'Apex Legends',
  pointUnit: 'RP',
  themeColor: '#ef4444',
  rankTiers: APEX_RANK_THRESHOLDS,
  createdAt: Date.now()
}

const DEFAULT_VALORANT_GAME: Game = {
  id: 'valorant',
  name: 'Valorant',
  pointUnit: 'RR',
  themeColor: '#8b5cf6',
  rankTiers: VALORANT_RANK_THRESHOLDS,
  createdAt: Date.now()
}

const DEFAULT_LOL_GAME: Game = {
  id: 'league-of-legends',
  name: 'League of Legends',
  pointUnit: 'LP',
  themeColor: '#10b981',
  rankTiers: LOL_RANK_THRESHOLDS,
  createdAt: Date.now()
}

const DEFAULT_SF6_GAME: Game = {
  id: 'street-fighter-6',
  name: 'Street Fighter 6',
  pointUnit: 'LP',
  themeColor: '#f97316',
  rankTiers: SF6_RANK_THRESHOLDS,
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
      const selectedGame = gameData.games.find(g => g.id === 'apex-legends') || DEFAULT_GAMES[0]
      // TODO: migrateOldRecords関数を実装するか、既存データの移行ロジックを追加
      const migratedRecords: GameRecord[] = [] // 仮の空配列
      
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
    const selectedGame = gameData.games.find(g => g.id === gameData.selectedGameId) || DEFAULT_GAMES[0]
    
    // タイムスタンプを正確に作成
    const dateTimeString = record.date + ' ' + record.time
    const timestamp = new Date(dateTimeString).getTime()
    
    const newRecord: GameRecord = {
      ...record,
      id: Date.now().toString(),
      gameId: gameData.selectedGameId,
      timestamp: timestamp
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
