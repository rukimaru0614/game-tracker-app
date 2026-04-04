// @ts-nocheck
'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, AlertCircle, Trophy, Target, TrendingUp, Calendar, BarChart3, Users, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useGameData, type Game, type GameRecord } from '../hooks/useGameData'
import { calculateRankFromTotalRP } from '../utils/unifiedRankCalculator'
import { getGameRankGroups, isGameRankingBased, getGameValidDivisions } from '../utils/gameUtils'
import { getGameRankThresholds } from '../utils/rankThresholds'
import { calculateAnalyticsData, type AnalyticsData } from '../utils/analyticsCalculator'
import { getGoalLines, type GoalLine } from '../utils/goalLines'

// 目標ポイント設定の型
interface GoalSettings {
  targetRP: number
  targetRank: string
  deadline: string
  isActive: boolean
}

export default function Home() {
  const { 
    selectedGame, 
    allGames, 
    gameRecords, 
    selectGame, 
    addRecord, 
    deleteRecord,
    isLoading,
    error 
  } = useGameData()

  // フォーム状態
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedRank, setSelectedRank] = useState('')
  const [selectedDivision, setSelectedDivision] = useState('')
  const [currentTierPoints, setCurrentTierPoints] = useState('')
  const [memo, setMemo] = useState('')
  const [matches, setMatches] = useState('')
  const [bestPlacement, setBestPlacement] = useState('')
  const [rankingPosition, setRankingPosition] = useState('') // ランキング制ランクの順位
  const [showGameSelector, setShowGameSelector] = useState(false)
  const [selectedChartPoint, setSelectedChartPoint] = useState<GameRecord | null>(null)
  const [periodFilter, setPeriodFilter] = useState<'all' | 'week' | 'month'>('all')
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  
  // 目標設定状態
  const [goalSettings, setGoalSettings] = useState<GoalSettings>({
    targetRP: 0,
    targetRank: '',
    deadline: '',
    isActive: false
  })
  
  // 連続ログイン日数の管理
  const [loginStreak, setLoginStreak] = useState(0)
  const [lastLoginDate, setLastLoginDate] = useState<string | null>(null)
  
  // データ洗浄と重複削除（初回読み込み時のみ実行）
  useEffect(() => {
    // 初回マウント時のみデータ洗浄を実行
    const storedData = localStorage.getItem('gameData')
    if (storedData) {
      try {
        const gameData = JSON.parse(storedData)
        if (gameData.records && gameData.records.length > 0) {
          // ダミーデータのフィルタリング
          const filteredRecords = gameData.records.filter((record: any) => {
            if (record.points === 0 && record.currentTier === 'ルーキー') return false
            if (record.points === 15450) return false
            if (record.points === 0 && record.currentTier === '入力済み') return false
            return true
          })
          
          // タイムスタンプで重複削除
          const uniqueRecords = new Map()
          filteredRecords.forEach((record: any) => {
            uniqueRecords.set(record.timestamp, record)
          })
          
          const finalRecords = Array.from(uniqueRecords.values()).sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          
          if (finalRecords.length !== gameData.records.length) {
            const cleanedData = {
              ...gameData,
              records: finalRecords
            }
            localStorage.setItem('gameData', JSON.stringify(cleanedData))
            setGameData(cleanedData)
          }
        }
      } catch (error) {
        console.error('データ洗浄エラー:', error)
      }
    }
  }, [])

  // ログインストリークの計算
  useEffect(() => {
    const calculateLoginStreak = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // 時間をリセット
      
      const storedLastLogin = localStorage.getItem('lastLoginDate')
      const storedStreak = localStorage.getItem('loginStreak')
      
      if (storedLastLogin) {
        const lastLogin = new Date(storedLastLogin)
        lastLogin.setHours(0, 0, 0, 0)
        
        const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 1) {
          // 連続ログイン
          const newStreak = parseInt(storedStreak || '0') + 1
          setLoginStreak(newStreak)
          localStorage.setItem('loginStreak', newStreak.toString())
        } else if (daysDiff > 1) {
          // 連続が切れた
          setLoginStreak(1)
          localStorage.setItem('loginStreak', '1')
        } else {
          // 同日ログイン
          setLoginStreak(parseInt(storedStreak || '0'))
        }
      } else {
        // 初回ログイン
        setLoginStreak(1)
        localStorage.setItem('loginStreak', '1')
      }
      
      localStorage.setItem('lastLoginDate', today.toISOString())
      setLastLoginDate(today.toISOString())
    }
    
    calculateLoginStreak()
  }, [])

  // 目標設定の保存
  const saveGoalSettings = () => {
    localStorage.setItem('goalSettings', JSON.stringify(goalSettings))
    setShowGoalForm(false)
  }

  // 目標設定の読み込み
  useEffect(() => {
    const stored = localStorage.getItem('goalSettings')
    if (stored) {
      setGoalSettings(JSON.parse(stored))
    }
  }, [])

  const saveRecord = async () => {
    if (!selectedRank) {
      alert('ランクを選択してください')
      return
    }

    if (!selectedGame) {
      alert('ゲームを選択してください')
      return
    }

    try {
      const newRecord: GameRecord = {
        id: Date.now().toString(),
        gameId: selectedGame.id,
        date: selectedDate,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        currentTier: selectedRank || '入力済み',
        division: selectedDivision,
        points: calculateTotalPoints(),
        tierPoints: parseInt(currentTierPoints) || 0,
        rankingPosition: parseInt(rankingPosition) || 0,
        memo: memo,
        matches: parseInt(matches) || undefined,
        bestPlacement: parseInt(bestPlacement) || undefined,
        timestamp: new Date().toISOString()
      }

      await addRecord(newRecord)
      
      // フォームをリセット
      setSelectedRank('')
      setSelectedDivision('')
      setCurrentTierPoints('')
      setMemo('')
      setMatches('')
      setBestPlacement('')
      setRankingPosition('')
      
      // 成功メッセージ
      alert('記録を保存しました！')
    } catch (error) {
      console.error('記録の保存に失敗しました:', error)
      alert('記録の保存に失敗しました')
    }
  }

  const calculateTotalPoints = () => {
    // ランク選択ベースの計算
    if (!selectedRank || !selectedGame) return 0
    
    const thresholds = getGameRankThresholds(selectedGame.id)
    const rankThreshold = thresholds.find(t => t.name === selectedRank)
    
    if (!rankThreshold) return 0
    
    let totalPoints = rankThreshold.minPoints
    
    if (selectedDivision) {
      const divisionIndex = getGameValidDivisions(selectedGame.id, selectedRank).indexOf(selectedDivision)
      if (divisionIndex > 0) {
        totalPoints += divisionIndex * 250 // ディビジョンごとに250RP加算
      }
    }
    
    totalPoints += parseInt(currentTierPoints) || 0
    
    if (isGameRankingBased(selectedRank) && rankingPosition) {
      totalPoints += parseInt(rankingPosition) || 0
    }
    
    return totalPoints
  }

  const getLatestRecord = () => {
    if (gameRecords.length === 0) return null
    return gameRecords.reduce((latest, record) => {
      const latestDate = new Date(latest.date + ' ' + latest.time)
      const recordDate = new Date(record.date + ' ' + record.time)
      return recordDate > latestDate ? record : latest
    })
  }

  const getDailyChange = () => {
    if (gameRecords.length === 0) return 0
    const today = new Date().toISOString().split('T')[0]
    const todayRecords = gameRecords.filter(r => r.date === today)
    if (todayRecords.length === 0) return 0
    
    const firstRecord = todayRecords[0]
    const lastRecord = todayRecords[todayRecords.length - 1]
    return lastRecord.points - firstRecord.points
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

  const handleChartClick = () => {
    // グラフクリック時の処理（空関数）
  }

  // データ同期のためのuseEffect
  useEffect(() => {
    // gameRecordsが更新されたら、全ての計算を再実行
    if (gameRecords.length > 0) {
      const latest = gameRecords[gameRecords.length - 1]
      // 強制的に再計算をトリガー
      console.log('Data sync triggered:', latest.points)
    }
  }, [gameRecords])

  // データの単一ソース化 - 最新レコードを常に取得
  const latestRecord = useMemo(() => {
    if (gameRecords.length === 0) return null
    return gameRecords[gameRecords.length - 1]
  }, [gameRecords])
  
  const dailyChange = useMemo(() => getDailyChange(), [gameRecords])
  
  // 新しい物理的判定関数を使用して現在のランクを計算
  const currentRank = useMemo(() => latestRecord ? calculateRankFromTotalRP(latestRecord.points) : null, [latestRecord])
  
  // アナリティクスデータの計算
  const analyticsData = useMemo(() => calculateAnalyticsData(gameRecords, goalSettings.targetRP), [gameRecords, goalSettings.targetRP])
  const goalLines = useMemo(() => getGoalLines(gameRecords.length), [gameRecords.length])
  
  // グラフデータの重複排除と同期
  const chartData = useMemo(() => {
    // timestampで重複排除
    const uniqueRecords = new Map<string, GameRecord>()
    gameRecords.forEach(record => {
      uniqueRecords.set(record.timestamp, record)
    })
    
    const sortedRecords = Array.from(uniqueRecords.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    
    const filteredRecords = sortedRecords.filter(record => {
      const recordDate = new Date(record.date)
      const now = new Date()
      
      if (periodFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return recordDate >= weekAgo
      } else if (periodFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return recordDate >= monthAgo
      }
      return true
    })

    return filteredRecords.map((record, index) => ({
      ...record,
      fullRecord: record,
      displayDate: new Date(record.date).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric'
      })
    }))
  }, [gameRecords, periodFilter])

  // 目標までの残りRPを計算
  const remainingToGoal = useMemo(() => {
    if (!goalSettings.isActive || goalSettings.targetRP <= 0) return 0
    if (!latestRecord) return goalSettings.targetRP
    return Math.max(0, goalSettings.targetRP - latestRecord.points)
  }, [goalSettings, latestRecord])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
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
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-200 text-sm">保存中...</span>
          </div>
        </div>
      )}
      
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">ゲームトラッカー</h1>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-400">
              連続ログイン: <span className="text-5xl font-extrabold text-yellow-400">{loginStreak}</span>日
            </div>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`p-2 rounded-lg transition-colors ${
                showAnalytics ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* ゲームセレクター */}
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

      {/* 目標設定表示 - 削除 */}

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
                <div className="text-sm text-gray-400">
                  累計: {latestRecord.points.toLocaleString()} {selectedGame.pointUnit}
                </div>
                <div className="text-lg font-bold text-blue-400">
                  ティア内: {currentRank?.tierPoints?.toLocaleString() || 0} / {currentRank?.maxTierPoints?.toLocaleString() || 0} {selectedGame.pointUnit}
                </div>
                {/* 目標RPの表示 */}
                {goalSettings.isActive && goalSettings.targetRP > 0 && (
                  <div className="text-sm text-yellow-400 mt-1">
                    目標: {goalSettings.targetRP.toLocaleString()} {selectedGame.pointUnit}
                  </div>
                )}
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
              </div>
            )}
          </div>
        </div>
      )}

      {/* 目標表示（強制表示・text-6xl） - final-fix-123 */}
      {goalSettings.isActive && goalSettings.targetRP > 0 && remainingToGoal > 0 && (
        <div className="mb-6 bg-gray-800 rounded-lg p-6">
          <div className="text-center">
            <div className="text-6xl font-extrabold text-orange-500">
              あと {remainingToGoal.toLocaleString()} RP
            </div>
            <div className="text-sm text-gray-400 mt-2">
              目標: {goalSettings.targetRP.toLocaleString()} {selectedGame.pointUnit}
            </div>
          </div>
        </div>
      )}

      {/* 記録入力フォーム */}
      <div className="mb-6 bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">新しい記録</h2>
          <button
            onClick={() => setShowGoalForm(!showGoalForm)}
            className={`p-2 rounded-lg transition-colors ${
              showGoalForm ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <Target className="w-5 h-5" />
          </button>
        </div>
        
        {/* 目標設定フォーム */}
        {showGoalForm && (
          <div className="mb-4 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-md font-semibold mb-3">目標を設定</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="target-rp" className="block text-sm font-medium mb-2">目標RP</label>
                <input
                  id="target-rp"
                  name="target-rp"
                  type="number"
                  value={goalSettings.targetRP}
                  onChange={(e) => setGoalSettings({...goalSettings, targetRP: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white"
                  placeholder="例: 10000"
                />
              </div>
              <div>
                <label htmlFor="target-rank" className="block text-sm font-medium mb-2">目標ランク</label>
                <input
                  id="target-rank"
                  name="target-rank"
                  type="text"
                  value={goalSettings.targetRank}
                  onChange={(e) => setGoalSettings({...goalSettings, targetRank: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white"
                  placeholder="例: ダイヤモンド"
                />
              </div>
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium mb-2">期限</label>
                <input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={goalSettings.deadline}
                  onChange={(e) => setGoalSettings({...goalSettings, deadline: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={saveGoalSettings}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  目標を保存
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {/* 日付選択 */}
          <div>
            <label htmlFor="selected-date" className="block text-sm font-medium mb-2">日付</label>
            <input
              id="selected-date"
              name="selected-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
            />
          </div>

          {/* ランク選択 */}
          <div>
            <label className="block text-sm font-medium mb-2">ランク</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(getGameRankGroups(selectedGame.id)).map(([rankKey, group]) => (
                <button
                  key={rankKey}
                  onClick={() => {
                    setSelectedRank(group.name)
                    setSelectedDivision('')
                    setRankingPosition('')
                  }}
                  className={`p-2 rounded-lg text-sm transition-colors ${
                    selectedRank === group.name 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{group.icon}</span>
                    <span>{group.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ディビジョン選択（通常ランクの場合） */}
          {selectedRank && !isGameRankingBased(selectedRank) && (
            <div>
              <label className="block text-sm font-medium mb-2">ディビジョン</label>
              <div className="grid grid-cols-4 gap-2">
                {getGameValidDivisions(selectedGame.id, selectedRank).map((division) => (
                  <button
                    key={division}
                    onClick={() => setSelectedDivision(division)}
                    className={`p-2 rounded-lg text-sm transition-colors ${
                      selectedDivision === division 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {division}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 順位入力（ランキング制ランクの場合） */}
          {selectedRank && isGameRankingBased(selectedRank) && (
            <div>
              <label htmlFor="ranking-position" className="block text-sm font-medium mb-2">順位</label>
              <input
                id="ranking-position"
                name="ranking-position"
                type="number"
                value={rankingPosition}
                onChange={(e) => setRankingPosition(e.target.value)}
                placeholder="例: 1234"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
              />
            </div>
          )}

          {/* ティア内RP入力（通常ランクの場合） */}
          {selectedRank && !isGameRankingBased(selectedRank) && (
            <div>
              <label htmlFor="tier-points" className="block text-sm font-medium mb-2">ティア内RP</label>
              <input
                id="tier-points"
                name="tier-points"
                type="number"
                value={currentTierPoints}
                onChange={(e) => setCurrentTierPoints(e.target.value)}
                placeholder="例: 150"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
              />
            </div>
          )}

          {/* メモ入力 */}
          <div>
            <label htmlFor="memo" className="block text-sm font-medium mb-2">メモ（任意）</label>
            <textarea
              id="memo"
              name="memo"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="今日の練習で気づいたこと、改善点など"
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white resize-none"
            />
          </div>

          {/* 試合数と最高順位 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="matches" className="block text-sm font-medium mb-2">試合数（任意）</label>
              <input
                id="matches"
                name="matches"
                type="number"
                value={matches}
                onChange={(e) => setMatches(e.target.value)}
                placeholder="例: 5"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
              />
            </div>
            <div>
              <label htmlFor="best-placement" className="block text-sm font-medium mb-2">最高順位（任意）</label>
              <input
                id="best-placement"
                name="best-placement"
                type="number"
                value={bestPlacement}
                onChange={(e) => setBestPlacement(e.target.value)}
                placeholder="例: 1"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
              />
            </div>
          </div>

          {/* 保存ボタン */}
          <button
            onClick={saveRecord}
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {isLoading ? '保存中...' : '記録を保存'}
          </button>
        </div>
      </div>

      {/* グラフ */}
      {chartData.length > 0 && (
        <div className="mb-6 bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">ポイント推移</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setPeriodFilter('all')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  periodFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                全期間
              </button>
              <button
                onClick={() => setPeriodFilter('week')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  periodFilter === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                1週間
              </button>
              <button
                onClick={() => setPeriodFilter('month')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  periodFilter === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                1ヶ月
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} onClick={handleChartClick}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="displayDate" 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line
                type="monotone"
                dataKey="points"
                stroke={selectedGame.themeColor}
                strokeWidth={2}
                dot={{ fill: selectedGame.themeColor, r: 4 }}
                activeDot={{ r: 6 }}
              />
              {/* 目標ライン */}
              {goalLines.map((line, index) => (
                <ReferenceLine
                  key={index}
                  y={line.rp}
                  stroke={line.color}
                  strokeDasharray="5 5"
                  label={line.label}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 推定試合数表示（グラフのすぐ下・text-3xl） - final-fix-123 */}
      {goalSettings.isActive && analyticsData && analyticsData.estimatedMatchesToGoal > 0 && (
        <div className="mb-6 bg-gray-800 rounded-lg p-4">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-yellow-400">
              あと約 {analyticsData.estimatedMatchesToGoal} 試合で目標達成！
            </div>
            <div className="text-sm text-gray-400 mt-2">
              直近5試合の平均上昇RPから算出
            </div>
          </div>
        </div>
      )}

      {/* 履歴 - 完全に削除 */}

      {/* 選択されたデータポイントの詳細 */}
      {selectedChartPoint && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">記録詳細</h3>
              <button
                onClick={() => setSelectedChartPoint(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-400 mb-1">日時</div>
                <div className="font-medium">
                  {formatDate(selectedChartPoint.date)} {selectedChartPoint.time}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">ランク</div>
                <div className="font-medium">{selectedChartPoint.currentTier}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">累計RP</div>
                <div className="font-medium text-blue-400">
                  {selectedChartPoint.points.toLocaleString()} {selectedGame.pointUnit}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">ティア内RP</div>
                <div className="font-medium">
                  {selectedChartPoint.tierPoints.toLocaleString()} {selectedGame.pointUnit}
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

      {/* フッター - PCでのクレジット表示 */}
      <div className="hidden md:block fixed bottom-4 right-4 text-xs text-gray-500 z-10">
        <div className="bg-gray-800 bg-opacity-90 px-2 py-1 rounded">
          Developed by IR | v1.2.0
        </div>
      </div>
      
      {/* モバイル用最下部余白 */}
      <div className="md:hidden pb-64"></div>
    </div>
  )
}
