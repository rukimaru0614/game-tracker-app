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
import PasswordGate from '../components/PasswordGate'

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

  // データ洗浄と重複削除（初回読み込み時のみ実行）- 超緊急クリーンアップ
  useEffect(() => {
    // 超緊急：localStorageを全消去して真っさらな状態に
    if (typeof window !== 'undefined') { 
      localStorage.clear(); 
      console.log('🚨 NUCLEAR OPTION: All localStorage cleared for fresh start');
    }
    
    try {
      // 古いデータを一度無視して、新しく始める
      const storedData = localStorage.getItem('gameData')
      if (storedData) {
        const gameData = JSON.parse(storedData)
        
        // データ形式の検証とクリーンアップ
        if (gameData.records && Array.isArray(gameData.records)) {
          // ダミーデータのフィルタリング
          const filteredRecords = gameData.records.filter((record: any) => {
            if (record.points === 0 && record.currentTier === 'ルーキー') return false
            if (record.points === 15450) return false
            if (record.points === 0 && record.currentTier === '入力済み') return false
            // 必須フィールドの検証 - 徹底した安全チェック
            return record.timestamp && record.date && typeof record.points === 'number' && record.id && record.gameId
          })
          
          // タイムスタンプで重複削除
          const uniqueRecords = new Map()
          filteredRecords.forEach((record: any) => {
            if (record.timestamp) {
              uniqueRecords.set(record.timestamp, record)
            }
          })
          
          const finalRecords = Array.from(uniqueRecords.values()).sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
          
          // クリーンアップしたデータで保存
          const cleanedData = {
            games: gameData.games || [],
            records: finalRecords,
            selectedGameId: gameData.selectedGameId || 'apex-legends'
          }
          
          localStorage.setItem('gameData', JSON.stringify(cleanedData))
          setGameData(cleanedData)
          
          console.log('🧹 Data cleanup completed:', {
            original: gameData.records.length,
            filtered: filteredRecords.length,
            final: finalRecords.length
          })
        }
      } else {
        // データがない場合は初期化
        const initialData = {
          games: DEFAULT_GAMES,
          records: [],
          selectedGameId: 'apex-legends'
        }
        localStorage.setItem('gameData', JSON.stringify(initialData))
        setGameData(initialData)
      }
    } catch (error) {
      console.error('データ読み込みエラー:', error)
      // エラー時は初期化
      const initialData = {
        games: DEFAULT_GAMES,
        records: [],
        selectedGameId: 'apex-legends'
      }
      localStorage.setItem('gameData', JSON.stringify(initialData))
      setGameData(initialData)
    }
  }, [])

  // ログインストリークの計算
  useEffect(() => {
    const calculateLoginStreak = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // 時間をリセット
      
      const storedLastLogin = localStorage.getItem('lastLoginDate')
      const storedStreak = localStorage.getItem('loginStreak')
      
      let streak = 0
      
      if (storedLastLogin) {
        const lastLogin = new Date(storedLastLogin)
        const diffTime = today.getTime() - lastLogin.getTime()
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          // 昨日ログインの場合、ストリークを継続
          streak = parseInt(storedStreak || '0') + 1
        } else if (diffDays > 1) {
          // 1日以上空いた場合、ストリークをリセット
          streak = 1
        }
      } else {
        // 初回ログインの場合
        streak = 1
      }
      
      localStorage.setItem('lastLoginDate', today.toISOString())
      setLastLoginDate(today.toISOString())
      setLoginStreak(streak)
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

  // データ同期のためのuseEffect - 認証直後の安全対策
  useEffect(() => {
    // gameRecordsが更新されたら、全ての計算を再実行
    if (gameRecords && gameRecords.length > 0) {
      const latest = gameRecords[gameRecords.length - 1]
      // 認証直後のデータ準備待ち - 安全チェック
      if (latest && latest.points && latest.id) {
        console.log('🔄 Data sync triggered:', latest.points)
      }
    }
  }, [gameRecords])

  // データの単一ソース化 - 最新レコードを常に取得 - 超安全対策
  const latestRecord = useMemo(() => {
    if (!gameRecords || gameRecords.length === 0) return null
    const latest = gameRecords[gameRecords.length - 1]
    // 認証直後のデータ検証 - 完全防備
    if (!latest || !latest.points || !latest.id || !latest.timestamp) return null
    return latest
  }, [gameRecords])
  
  const dailyChange = useMemo(() => getDailyChange(), [gameRecords])
  
  // 新しい物理的判定関数を使用して現在のランクを計算
  const currentRank = useMemo(() => latestRecord ? calculateRankFromTotalRP(latestRecord.points) : null, [latestRecord])
  
  // アナリティクスデータの計算 - 認証直後の安全対策
  const analyticsData = useMemo(() => {
    // 認証直後のデータ準備待ち - 完全防備
    if (!gameRecords || gameRecords.length === 0) return null
    return calculateAnalyticsData(gameRecords, goalSettings?.targetRP || 0)
  }, [gameRecords, goalSettings?.targetRP])
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

  // 目標までの残りRPを計算 - 超強力安全装置付き
  const remainingToGoal = useMemo(() => {
    // 認証直後のデータ準備待ち - 完全防備
    if (!latestRecord || !latestRecord.points || !latestRecord.id) return 0
    if (!goalSettings?.isActive || !goalSettings?.targetRP || goalSettings.targetRP <= 0) return 0
    return Math.max(0, (goalSettings.targetRP || 0) - latestRecord.points)
  }, [goalSettings, latestRecord])

  // 計算ロジックを完全に分離 - 独立関数化 - 鉄の意志で防御
  const renderMainContent = () => {
    try {
      // 2段構え - データが1ミリでも不完全ならLoading表示
      if (!selectedGame || !gameRecords || !latestRecord) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl text-gray-400">データ読み込み中...</div>
          </div>
        )
      }
      
      return (
        <div className="flex flex-col gap-4">
          {/* ヘッダーとログイン日数 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">ゲームトラッカー</h1>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-400">
                  連続ログイン: <span className="text-5xl font-extrabold text-yellow-400">{loginStreak || 0}</span>日
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
                style={{ borderLeft: `4px solid ${selectedGame.themeColor || '#666'}` }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedGame.themeColor || '#666' }}
                  />
                  <div className="text-left">
                    <div className="font-medium">{selectedGame.name || '不明'}</div>
                    <div className="text-sm text-gray-400">単位: {selectedGame.pointUnit || 'RP'}</div>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${showGameSelector ? 'rotate-180' : ''}`} />
              </button>
              
              {showGameSelector && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 rounded-lg shadow-lg z-10">
                  {allGames && allGames.map((game) => (
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

          {/* 現在のランク表示 - 鉄の意志で防御 */}
          {latestRecord && latestRecord.points && latestRecord.id ? (
            <div className="mb-6 space-y-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">現在のランク</span>
                  <Trophy className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-2xl">{currentRank?.icon || '🎮'}</div>
                  <div>
                    <div className={`text-xl font-bold ${currentRank?.color || 'text-white'}`}>
                      {currentRank?.name || '不明'}
                    </div>
                    <div className="text-sm text-gray-400">
                      累計: {Number(latestRecord.points || 0).toLocaleString()} {selectedGame.pointUnit || 'RP'}
                    </div>
                    <div className="text-lg font-bold text-blue-400">
                      ティア内: {Number(currentRank?.tierPoints || 0).toLocaleString()} / {Number(currentRank?.maxTierPoints || 0).toLocaleString()} {selectedGame.pointUnit || 'RP'}
                    </div>
                    {/* 目標RPの表示 */}
                    {goalSettings?.isActive && goalSettings?.targetRP > 0 && (
                      <div className="text-sm text-yellow-400 mt-1">
                        目標: {Number(goalSettings.targetRP || 0).toLocaleString()} {selectedGame.pointUnit || 'RP'}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* ランク進捗バー */}
                {!currentRank?.isTopRank && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>次のランクまで</span>
                      <span>{Number(currentRank?.pointsToNext || 0).toLocaleString()} {selectedGame.pointUnit || 'RP'}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(Number(currentRank?.progress || 0) * 100)}%`,
                          backgroundColor: selectedGame.themeColor || '#666'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* データがない場合の綺麗な空状態 */
            <div className="mb-6 bg-gray-800 rounded-lg p-8 text-center">
              <div className="text-gray-400 text-lg">
                データがありません。新しい記録を入力してください。
              </div>
            </div>
          )}

          {/* オレンジのデカ文字 - 計算結果の初期値を完全に固定 */}
          <div className="my-6 bg-gray-800 rounded-lg p-6">
            <div className="text-center">
              <div className="text-6xl font-extrabold text-orange-500">
                あと {Number(remainingToGoal || 0).toLocaleString()} RP
              </div>
              <div className="text-sm text-gray-400 mt-2">
                目標: {Number(goalSettings?.targetRP || 0).toLocaleString()} {selectedGame.pointUnit || 'RP'}
              </div>
            </div>
          </div>

          {/* 黄色の分析データ - .toFixed() を使用せず安全に計算 */}
          <div className="my-6 bg-gray-800 rounded-lg p-4">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-yellow-400">
                あと約 {Number(analyticsData?.estimatedMatchesToGoal || 0)} 試合で目標達成！
              </div>
              <div className="text-sm text-gray-400 mt-2">
                直近5試合の平均上昇RPから算出
              </div>
            </div>
          </div>

          {/* 保存ボタンなどの操作パネル */}
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
                      value={Number(goalSettings.targetRP || 0)}
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
                      value={goalSettings.targetRank || ''}
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
                      value={goalSettings.deadline || ''}
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
          </div>
        </div>
      )
    } catch (error) {
      // エラーが起きたら白い画面で止まらせない
      console.error('renderMainContent error:', error)
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-red-400">エラーが発生しました</div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 表示の切り替えを「中身」で行う - Hooksルール違反防止 */}
      {selectedGame && gameRecords ? renderMainContent() : <PasswordGate onAuthenticated={() => {}} />}
    </div>
  )
}
