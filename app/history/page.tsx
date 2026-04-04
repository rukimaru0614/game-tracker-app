'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, TrendingDown, Trophy, Calendar, Gamepad2, Medal } from 'lucide-react'
import Link from 'next/link'
import { useGameData } from '@/hooks/useGameData'
import { GameRecord } from '@/types/game'
import { calculateRankProgress, getDefaultRankInfo, getRank } from '@/utils/unifiedRankCalculator'

export default function History() {
  const { selectedGame, gameRecords } = useGameData()
  const [selectedRecord, setSelectedRecord] = useState<GameRecord | null>(null)

  const getRankTier = (points: number) => {
    if (!selectedGame) {
      return getDefaultRankInfo()
    }
    return calculateRankProgress(points || 0)
  }

  const getDailyChange = (currentIndex: number) => {
    if (currentIndex === 0) return 0
    const current = gameRecords[currentIndex]
    const previous = gameRecords[currentIndex - 1]
    return (current?.rp || 0) - (previous?.rp || 0)
  }

  const formatDateTime = (record: GameRecord) => {
    const date = new Date(record.timestamp)
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    }) + ' ' + record.time
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'short'
    })
  }

  const getShortMemo = (memo: string) => {
    return memo.length > 30 ? memo.substring(0, 30) + '...' : memo
  }

  return (
    <div className="flex-1 pb-20">
      <div className="p-4 max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-3">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{selectedGame.name} 履歴</h1>
            <p className="text-sm text-gray-400">単位: {selectedGame.pointUnit}</p>
          </div>
        </div>

        {gameRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>記録がありません</p>
            <p className="text-sm mt-2">まずは{selectedGame.pointUnit}を記録してみましょう</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gameRecords.slice().reverse().map((record, index) => {
              const reversedIndex = gameRecords.length - 1 - index
              const dailyChange = getDailyChange(reversedIndex)
              const rank = record.rank ? { name: record.rank, color: '#60A5FA', icon: '🏆' } : getRank(record?.rp || 0)
              const change = reversedIndex > 0 ? (record?.rp || 0) - (gameRecords[reversedIndex - 1]?.rp || 0) : 0
              
              return (
                <div
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center text-sm text-gray-400 mb-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(record.date)} {record.time}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-sm font-medium ${rank.color} flex items-center space-x-1`}>
                            <span>{rank.icon}</span>
                            <span>{rank.name}{record.division ? ` ${record.division}` : ''}</span>
                          </div>
                          <div className="text-xl font-bold">
                            {Number(record.rp || 0).toLocaleString()} {selectedGame.pointUnit}
                          </div>
                        </div>
                        {reversedIndex > 0 && (
                          <div className={`flex items-center space-x-1 ${dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {dailyChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span className="font-bold text-sm">
                              {dailyChange >= 0 ? '+' : ''}{dailyChange.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                    {record.matches && (
                      <div className="flex items-center">
                        <Gamepad2 className="w-4 h-4 mr-1" />
                        {record.matches}試合
                      </div>
                    )}
                    {record.bestPlacement && (
                      <div className="flex items-center">
                        <Medal className="w-4 h-4 mr-1" />
                        {record.bestPlacement}位
                      </div>
                    )}
                  </div>
                  
                  {record.memo && (
                    <div className="text-sm text-gray-300">
                      {getShortMemo(record.memo)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 詳細モーダル */}
      {selectedRecord && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRecord(null)}
        >
          <div 
            className="bg-gray-800 rounded-lg p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">記録詳細</h2>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">日時</div>
                <div className="font-medium">{formatDateTime(selectedRecord)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">{selectedGame.pointUnit}</div>
                <div className="text-2xl font-bold">{selectedRecord.points.toLocaleString()} {selectedGame.pointUnit}</div>
                <div className={`text-sm font-medium flex items-center space-x-1 ${getRankTier(selectedRecord.points).color}`}>
                  <span>{getRankTier(selectedRecord.points).icon}</span>
                  <span>{getRankTier(selectedRecord.points).name}</span>
                </div>
              </div>
              
              {selectedRecord.matches && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">マッチ数</div>
                  <div className="font-medium">{selectedRecord.matches} 試合</div>
                </div>
              )}
              
              {selectedRecord.bestPlacement && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">最高順位</div>
                  <div className="font-medium">{selectedRecord.bestPlacement} 位</div>
                </div>
              )}
              
              {selectedRecord.memo && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">振り返りメモ</div>
                  <div className="font-medium whitespace-pre-wrap">{selectedRecord.memo}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
