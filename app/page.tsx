// @ts-nocheck
'use client'

import { useGameData, type Game, type GameRecord } from '../hooks/useGameData'
import MainContent from '../components/MainContent'

export default function Home() {
  const { 
    selectedGame, 
    gameRecords
  } = useGameData()

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <MainContent />
    </div>
  )
}
