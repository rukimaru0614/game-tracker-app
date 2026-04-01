'use client'

import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, Trophy, Target, BarChart3, ChevronDown, Gamepad2, AlertCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts'
import Link from 'next/link'
import { useGameData } from '@/hooks/useGameData'
import { GameRecord } from '@/types/game'
import { calculateRank, getRankWithDivision } from '@/utils/rankCalculator'

export default function Home() {
  const { selectedGame, gameRecords, addRecord, allGames, selectGame } = useGameData()
  const [currentPoints, setCurrentPoints] = useState('')
  const [memo, setMemo] = useState('')
  const [matches, setMatches] = useState('')
  const [bestPlacement, setBestPlacement] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedChartPoint, setSelectedChartPoint] = useState<GameRecord | null>(null)
  const [showGameSelector, setShowGameSelector] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const saveRecord = () => {
    try {
      setError(null)
      setIsLoading(true)
      
      if (!currentPoints) {
        setError('ポイントを入力してください')
        return
      }

      const points = parseInt(currentPoints)
      if (isNaN(points) || points < 0) {
        setError('有効なポイント数を入力してください')
        return
      }

      const now = new Date()
      addRecord({
        date: selectedDate,
        time: now.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        points: points,
        memo: memo,
        matches: matches ? parseInt(matches) : undefined,
        bestPlacement: bestPlacement ? parseInt(bestPlacement) : undefined
      })
      
      setCurrentPoints('')
      setMemo('')
      setMatches('')
      setBestPlacement('')
    } catch (err) {
      setError('記録の保存に失敗しました。もう一度お試しください。')
      console.error('Save record error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankTier = (points: number) => {
    try {
      if (!selectedGame) {
        return {
          name: 'ルーキー',
          color: 'text-stone-500',
          icon: '🌱',
          minPoints: 0,
          maxPoints: 999,
          progress: 0,
          pointsToNext: 1000,
          isTopRank: false
        }
      }
      return getRankWithDivision(points, selectedGame)
    } catch (err) {
      console.error('Rank calculation error:', err)
      return {
        name: 'エラー',
        color: 'text-red-500',
        icon: '❌',
        minPoints: 0,
        maxPoints: 0,
        progress: 0,
        pointsToNext: 0,
        isTopRank: false
      }
    }
  }

  const getLatestRecord = () => gameRecords[gameRecords.length - 1]
  const getPreviousRecord = () => gameRecords[gameRecords.length - 2]
  
  const getDailyChange = () => {
    const latest = getLatestRecord()
    const previous = getPreviousRecord()
    if (!latest || !previous) return 0
    return latest.points - previous.points
  }

  const getChartData = () => {
    return gameRecords.slice(-30).map(record => ({
      date: record.time ? `${new Date(record.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })} ${record.time}` : new Date(record.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      points: record.points,
      fullRecord: record
    }))
  }

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload[0]) {
      setSelectedChartPoint(data.activePayload[0].payload.fullRecord)
    }
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

  const latestRecord = getLatestRecord()
  const dailyChange = getDailyChange()
  const currentRank = latestRecord ? getRankTier(latestRecord.points) : null

  return (
    <div className="flex-1 pb-20">
      <div className="p-4 max-w-md mx-auto">
        {/* エラー表示 */}
        {error && (
          <div className="mb-4 bg-red-900 border border-red-700 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          </div>
        )}
        
        {/* ローディング表示 */}
        {isLoading && (
          <div className="mb-4 bg-blue-900 border border-blue-700 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-blue-200 text-sm">処理中...</span>
            </div>
          </div>
        )}
        
        {/* ゲームセレクター */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">ゲームトラッカー</h1>
            <Link href="/games" className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
              <Gamepad2 className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowGameSelector(!showGameSelector)}
              className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              style={{ borderLeft: `4px solid ${selectedGame.themeColor}` }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedGame.themeColor }}
                />
                <div className="text-left">
                  <div className="font-medium">{selectedGame.name}</div>
                  <div className="text-sm text-gray-400">単位: {selectedGame.pointUnit}</div>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 transition-transform ${showGameSelector ? 'rotate-180' : ''}`} />
            </button>
            
            {showGameSelector && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-lg shadow-lg z-10">
                {allGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => {
                      selectGame(game.id)
                      setShowGameSelector(false)
                    }}
                    className={`w-full flex items-center space-x-3 p-3 hover:bg-gray-700 transition-colors ${
                      selectedGame.id === game.id ? 'bg-gray-700' : ''
                    }`}
                    style={{ borderLeft: selectedGame.id === game.id ? `4px solid ${game.themeColor}` : 'none' }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: game.themeColor }}
                    />
                    <div className="text-left">
                      <div className="font-medium">{game.name}</div>
                      <div className="text-sm text-gray-400">単位: {game.pointUnit}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {latestRecord && (
          <div className="mb-6 space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-400">現在のランク</span>
                <Trophy className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex items-center space-x-3 mb-3">
                <div className="text-2xl">{currentRank?.icon}</div>
                <div>
                  <div className={`text-xl font-bold ${currentRank?.color}`}>
                    {currentRank?.name}
                  </div>
                  <div className="text-2xl font-bold">
                    {latestRecord.points.toLocaleString()} {selectedGame.pointUnit}
                  </div>
                </div>
              </div>
              
              {/* ランク進捗バー */}
              {!currentRank?.isTopRank && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>次のランクまで</span>
                    <span>{currentRank?.pointsToNext.toLocaleString()} {selectedGame.pointUnit}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(currentRank?.progress || 0) * 100}%`,
                        backgroundColor: selectedGame.themeColor
                      }}
                    />
                  </div>
                  <div className="text-center text-xs text-gray-400">
                    {Math.round((currentRank?.progress || 0) * 100)}%
                  </div>
                </div>
              )}
              
              {currentRank?.isTopRank && (
                <div className="text-center text-sm text-yellow-500 font-medium">
                  🏆 最高ランク達成！
                </div>
              )}
            </div>

            {getPreviousRecord() && (
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">前日比</span>
                  <div className={`flex items-center space-x-1 ${dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {dailyChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="font-bold">
                      {dailyChange >= 0 ? '+' : ''}{dailyChange.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            {selectedGame.pointUnit}を記録
          </h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">日付</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">現在の{selectedGame.pointUnit}</label>
              <input
                type="number"
                value={currentPoints}
                onChange={(e) => setCurrentPoints(e.target.value)}
                placeholder={`例: ${selectedGame.name === 'Apex Legends' ? '12000' : selectedGame.name === 'Valorant' ? '150' : selectedGame.name === 'League of Legends' ? '1500' : selectedGame.name === 'Street Fighter 6' ? '8000' : '1000'}`}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">マッチ数（任意）</label>
              <input
                type="number"
                value={matches}
                onChange={(e) => setMatches(e.target.value)}
                placeholder="例: 8"
                min="1"
                max="50"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">最高順位（任意）</label>
              <select
                value={bestPlacement}
                onChange={(e) => setBestPlacement(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
              >
                <option value="">選択してください</option>
                {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}位</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">振り返りメモ（任意）</label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="エイムが調子良かった、立ち回りが慎重すぎた、など"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white h-24 resize-none"
              />
            </div>
            
            <button
              onClick={saveRecord}
              disabled={!currentPoints || isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  保存中...
                </>
              ) : (
                '記録を保存'
              )}
            </button>
          </div>
        </div>

        {gameRecords.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              {selectedGame.pointUnit}推移グラフ
            </h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={getChartData()}
                  onClick={handleChartClick}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#9CA3AF' }}
                    formatter={(value: any, name: any, props: any) => {
                      const points = value as number
                      const rank = getRankTier(points)
                      return [
                        <div key="tooltip-content">
                          <div className="font-bold">{value.toLocaleString()} {selectedGame.pointUnit}</div>
                          <div className={`text-sm ${rank.color}`}>
                            {rank.icon} {rank.name}
                          </div>
                        </div>,
                        selectedGame.pointUnit
                      ]
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="points" 
                    stroke={selectedGame.themeColor} 
                    strokeWidth={2}
                    dot={{ fill: selectedGame.themeColor, r: 6, cursor: 'pointer' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* チャートポイント詳細モーダル */}
      {selectedChartPoint && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedChartPoint(null)}
        >
          <div 
            className="bg-gray-800 rounded-lg p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">記録詳細</h2>
              <button
                onClick={() => setSelectedChartPoint(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">日時</div>
                <div className="font-medium">{formatDateTime(selectedChartPoint)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">{selectedGame.pointUnit}</div>
                <div className="text-2xl font-bold">{selectedChartPoint.points.toLocaleString()} {selectedGame.pointUnit}</div>
                <div className={`text-sm font-medium ${getRankTier(selectedChartPoint.points).color}`}>
                  {getRankTier(selectedChartPoint.points).name}
                </div>
              </div>
              
              {selectedChartPoint.matches && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">マッチ数</div>
                  <div className="font-medium">{selectedChartPoint.matches} 試合</div>
                </div>
              )}
              
              {selectedChartPoint.bestPlacement && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">最高順位</div>
                  <div className="font-medium">{selectedChartPoint.bestPlacement} 位</div>
                </div>
              )}
              
              {selectedChartPoint.memo && (
                <div>
                  <div className="text-sm text-gray-400 mb-1">振り返りメモ</div>
                  <div className="font-medium whitespace-pre-wrap">{selectedChartPoint.memo}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
