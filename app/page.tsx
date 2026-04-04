// @ts-nocheck
'use client'

import { useState } from 'react'
import { useGameData, type Game, type GameRecord } from '../hooks/useGameData'
import MainContent from '../components/MainContent'
import PasswordGate from '../components/PasswordGate'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { 
    selectedGame, 
    gameRecords
  } = useGameData()

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {isAuthenticated ? <MainContent /> : <PasswordGate onAuthenticated={handleAuthenticated} />}
    </div>
  )
}
