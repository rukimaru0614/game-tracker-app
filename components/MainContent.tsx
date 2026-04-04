'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, AlertCircle, Trophy, Target, TrendingUp, Calendar, BarChart3, Users, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useGameData } from '../hooks/useGameData'
import { type GameRecord } from '../types/game'
import { calculateRankFromTotalRP, getRank } from '../utils/unifiedRankCalculator'
import { getGameRankGroups, isGameRankingBased, getGameValidDivisions } from '../utils/gameUtils'
import { getGameRankThresholds } from '../utils/rankThresholds'
import { calculateAnalyticsData, type AnalyticsData } from '../utils/analyticsCalculator'
import { getGoalLines, type GoalLine } from '../utils/goalLines'
import { type Game } from '../types/game'
import Tutorial from './Tutorial'

// 目標ポイント設定の型
interface GoalSettings {
  targetRP: number
  targetRank: string
  deadline: string
  isActive: boolean
}

// 計算ロジックをコンポーネントの外に出す - Reactの描画ルールとは無関係な場所に隔離
export const calculateSafeRemainingToGoal = (latestRecord: GameRecord | null, goalSettings: GoalSettings): number => {
  let result = 0; // 計算結果の初期値を完全に固定
  
  try {
    if (!latestRecord || !latestRecord.points || !latestRecord.id) return result;
    if (!goalSettings?.isActive || !goalSettings?.targetRP || goalSettings.targetRP <= 0) return result;
    
    result = Math.max(0, (goalSettings.targetRP || 0) - latestRecord.points);
  } catch (error) {
    console.error('calculateSafeRemainingToGoal error:', error);
  }
  
  return result;
};

export const calculateSafeAnalyticsData = (gameRecords: GameRecord[], targetRP: number): AnalyticsData | null => {
  let result: AnalyticsData | null = null; // 計算結果の初期値を完全に固定
  
  try {
    if (!gameRecords || gameRecords.length === 0) return result;
    result = calculateAnalyticsData(gameRecords, targetRP || 0);
  } catch (error) {
    console.error('calculateSafeAnalyticsData error:', error);
  }
  
  return result;
};

// ティア内RPの最大値を計算する関数
const getMaxTierPoints = (rank: string, division: string, gameId?: string): number => {
  if (!rank || !division) return 0
  
  // ゲームごとのティア内RP最大値
  if (gameId === 'league-of-legends' || gameId === 'valorant') {
    // LoL/VALOは1ティア内の上限を100に設定
    return 100
  }
  
  if (gameId === 'street-fighter-6') {
    // スト6は上限なし（または非常に大きな値）
    return 99999999
  }
  
  // Apex Legendsのティア内RP最大値（正しい表）
  const apexMaxPoints: { [key: string]: { [key: string]: number } } = {
    'ルーキー': { 'IV': 250, 'III': 250, 'II': 250, 'I': 250 },
    'ブロンズ': { 'IV': 500, 'III': 500, 'II': 500, 'I': 500 },
    'シルバー': { 'IV': 500, 'III': 500, 'II': 500, 'I': 750 },
    'ゴールド': { 'IV': 600, 'III': 600, 'II': 600, 'I': 800 },
    'プラチナ': { 'IV': 800, 'III': 800, 'II': 800, 'I': 1000 },
    'ダイヤモンド': { 'IV': 1000, 'III': 1000, 'II': 1000, 'I': 1250 }
  }
  
  return apexMaxPoints[rank]?.[division] || 0
}

// MP自動ランクアップロジック（ST6専用 - シンプル実装）
const handleTierPointsChange = (value: string, setCurrentTierPoints: any, selectedGame: any, selectedRank: string, selectedDivision: string) => {
  const numValue = parseInt(value) || 0
  const maxPoints = getMaxTierPoints(selectedRank, selectedDivision, selectedGame?.id)
  
  // 他のゲームの通常処理
  if (maxPoints > 0 && numValue > maxPoints) {
    if (selectedGame?.id === 'league-of-legends' || selectedGame?.id === 'valorant') {
      alert(`${selectedGame.name}のティア内RPは最大${maxPoints}までです`)
    } else {
      alert(`${selectedRank} ${selectedDivision}のティア内RPは最大${maxPoints}までです`)
    }
    setCurrentTierPoints(maxPoints.toString())
  } else {
    setCurrentTierPoints(value)
  }
}

export default function MainContent() {
  const { 
    selectedGame, 
    allGames, 
    gameRecords, 
    selectGame, 
    addRecord, 
    deleteRecord
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
  const [isMounted, setIsMounted] = useState(false) // useEffect 完了まで何も出さない旗
  const [showTutorial, setShowTutorial] = useState(false) // チュートリアル表示状態
  
  // useEffect 完了まで何も出さない旗 - 超安全化
  useEffect(() => {
    const initApp = async () => {
      try {
        // データの読み込み
        const saved = localStorage.getItem('gameRecords');
        if (saved) {
          // gameRecordsの更新はuseGameDataフックを通じて行う
          console.log('Data loaded from localStorage');
        }
      } catch (e) {
        console.error("Data load error:", e);
        // エラー時も何もしない - useGameDataフックが処理
      } finally {
        // エラーが起きても起きなくても、必ずマウント完了にする
        setIsMounted(true);
      }
    };
    initApp();
  }, [])

  // チュートリアル表示制御 - isMounted後のみ実行
  useEffect(() => {
    if (!isMounted) return // isMountedがtrueになるまで待機
    
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial')
    if (!hasSeenTutorial) {
      // 少し遅延して表示して、他の読み込みを優先
      const tutorialTimer = setTimeout(() => {
        setShowTutorial(true)
      }, 100) // 100msに短縮
      return () => clearTimeout(tutorialTimer)
    }
  }, [isMounted])

  const handleTutorialComplete = () => {
    setShowTutorial(false)
    localStorage.setItem('hasSeenTutorial', 'true')
  }

  const handleTutorialSkip = () => {
    setShowTutorial(false)
    localStorage.setItem('hasSeenTutorial', 'true')
  }
  
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

  // ログインストリークの計算
  useEffect(() => {
    const calculateLoginStreak = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // 時間をリセット
      const todayString = today.toLocaleDateString()
      
      const storedLastLogin = localStorage.getItem('lastLoginDate')
      const storedStreak = localStorage.getItem('loginStreak')
      
      let streak = 1 // デフォルト値
      
      if (storedLastLogin) {
        const lastLogin = new Date(storedLastLogin)
        lastLogin.setHours(0, 0, 0, 0) // 時間をリセット
        const lastLoginString = lastLogin.toLocaleDateString()
        
        if (lastLoginString === todayString) {
          // 今日すでにログイン済みなら何もしない
          streak = parseInt(storedStreak || '1') || 1
        } else {
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayString = yesterday.toLocaleDateString()
          
          if (lastLoginString === yesterdayString) {
            // 連続ログイン！
            streak = (parseInt(storedStreak || '1') || 1) + 1
          } else {
            // 途切れたので1に戻す
            streak = 1
          }
        }
      }
      
      // NaNチェックと安全な保存
      const safeStreak = isNaN(streak) ? 1 : Math.max(1, streak)
      
      localStorage.setItem('lastLoginDate', today.toISOString())
      localStorage.setItem('loginStreak', safeStreak.toString())
      setLastLoginDate(today.toISOString())
      setLoginStreak(safeStreak)
    }
    
    calculateLoginStreak()
  }, [])

  // 目標設定の保存
  const saveGoalSettings = () => {
    try {
      // 目標設定をlocalStorageに保存
      const updatedGoalSettings = {
        ...goalSettings,
        isActive: goalSettings.targetRP > 0
      }
      
      setGoalSettings(updatedGoalSettings)
      
      // 既存のgameDataに目標設定を追加（ゲームごとに保存）
      const storedData = localStorage.getItem('gameData')
      if (storedData) {
        const gameData = JSON.parse(storedData)
        
        // ゲームごとの目標設定を更新
        if (!gameData.goalSettingsMap) {
          gameData.goalSettingsMap = {}
        }
        gameData.goalSettingsMap[selectedGame.id] = updatedGoalSettings
        
        // 互換性のための全体目標設定も更新
        gameData.goalSettings = updatedGoalSettings
        
        localStorage.setItem('gameData', JSON.stringify(gameData))
      } else {
        // gameDataがない場合は新規作成
        const initialData = {
          games: [],
          records: [],
          selectedGameId: selectedGame?.id || 'apex-legends',
          goalSettings: updatedGoalSettings,
          goalSettingsMap: {
            [selectedGame?.id || 'apex-legends']: updatedGoalSettings
          }
        }
        localStorage.setItem('gameData', JSON.stringify(initialData))
      }
      
      setShowGoalForm(false)
      alert('目標を保存しました！')
    } catch (error) {
      console.error('目標の保存に失敗しました:', error)
      alert('目標の保存に失敗しました')
    }
  }

  // 目標設定の読み込み
  useEffect(() => {
    // まずlocalStorageから全体設定を読み込み
    const stored = localStorage.getItem('goalSettings')
    if (stored) {
      const globalGoal = JSON.parse(stored)
      setGoalSettings(globalGoal)
    }
    
    // gameDataからゲームごとの目標設定を読み込み（優先）
    const gameDataStored = localStorage.getItem('gameData')
    if (gameDataStored) {
      try {
        const gameData = JSON.parse(gameDataStored)
        
        // ゲームごとの目標設定を読み込み
        if (gameData.goalSettingsMap && selectedGame) {
          const gameSpecificGoal = gameData.goalSettingsMap[selectedGame.id]
          if (gameSpecificGoal) {
            setGoalSettings(gameSpecificGoal)
          } else {
            // ゲームごとの設定がない場合はデフォルト設定を使用
            const defaultGoal = {
              targetRP: 0,
              targetRank: '',
              deadline: '',
              isActive: false
            }
            setGoalSettings(defaultGoal)
          }
        } else if (gameData.goalSettings) {
          // 互換性のための全体目標設定
          setGoalSettings(gameData.goalSettings)
        }
      } catch (error) {
        console.error('Error loading game data:', error)
      }
    }
  }, [selectedGame])

  const calculateTotalPoints = () => {
    // ランク選択ベースの計算
    if (!selectedRank || !selectedGame) return 0
    
    const thresholds = getGameRankThresholds(selectedGame.id)
    
    // ランク名をマッチングさせるための処理
    let matchedRank = selectedRank
    if (selectedRank === 'ルーキー') matchedRank = 'ルーキーIV'
    if (selectedRank === 'ブロンズ') matchedRank = 'ブロンズIV'
    if (selectedRank === 'シルバー') matchedRank = 'シルバーIV'
    if (selectedRank === 'ゴールド') matchedRank = 'ゴールドIV'
    if (selectedRank === 'プラチナ') matchedRank = 'プラチナIV'
    if (selectedRank === 'ダイヤモンド') matchedRank = 'ダイヤモンドIV'
    if (selectedRank === 'マスター') matchedRank = 'マスター'
    if (selectedRank === 'プレデター') matchedRank = 'プレデター'
    
    const rankThreshold = thresholds.find(t => t.name === matchedRank)
    
    if (!rankThreshold) {
      return 0
    }
    
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
      day: 'numeric'
    })
  }

  const saveRecord = async () => {
    try {
      const newRecord: GameRecord = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        date: selectedDate,
        time: new Date().toTimeString().slice(0, 5),
        points: calculateTotalPoints(),
        currentTier: selectedRank || '入力済み',
        division: selectedDivision,
        points: calculateTotalPoints(),
        tierPoints: parseInt(currentTierPoints) || 0,
        rankingPosition: parseInt(rankingPosition) || 0,
        memo: memo,
        matches: parseInt(matches) || 0,
        bestPlacement: parseInt(bestPlacement) || 0,
        timestamp: Date.now()
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
  
  // アナリティクスデータの計算 - useMemoで無限ループを防止
  const analyticsData = useMemo(() => {
    try {
      return calculateSafeAnalyticsData(gameRecords || [], goalSettings?.targetRP || 0)
    } catch (error) {
      console.error('Analytics data calculation error:', error)
      return null
    }
  }, [gameRecords, goalSettings?.targetRP])
  
  const goalLines = useMemo(() => {
    try {
      return getGoalLines(gameRecords.length)
    } catch (error) {
      console.error('Goal lines calculation error:', error)
      return []
    }
  }, [gameRecords.length])
  
  // グラフデータの重複排除と同期
  const chartData = useMemo(() => {
    // timestampで重複排除
    const uniqueRecords = new Map<number, GameRecord>()
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
    return calculateSafeRemainingToGoal(latestRecord, goalSettings)
  }, [latestRecord, goalSettings])

  // useEffect 完了まで何も出さない - ブラウザの準備が100%整うまでローディング画面以外は一切描画させない
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-lg font-bold">システムを起動しています...</p>
        <button 
          onClick={() => setIsMounted(true)} 
          className="mt-8 text-xs text-gray-500 underline"
        >
          強制的に画面を表示する
        </button>
      </div>
    );
  }

  try {
    // 2段階検証 - データが1ミリでも不完全ならLoading表示
    if (!selectedGame) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-400">ゲーム選択中...</div>
        </div>
      )
    }
    
    if (!gameRecords) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-400">データ読み込み中...</div>
        </div>
      )
    }
    
    // データが空の場合でもメインコンテンツを表示
    return (
      <div className="flex flex-col gap-4 w-full min-h-screen pb-32">
        {/* チュートリアル */}
        <Tutorial 
          onComplete={handleTutorialComplete}
          onSkip={handleTutorialSkip}
        />
        
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
                  className={`w-full p-3 text-left hover:bg-gray-700 transition-colors ${
                    selectedGame?.id === game.id ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: game.themeColor || '#666' }}
                    />
                    <div className="text-left">
                      <div className="font-medium">{game.name}</div>
                      <div className="text-sm text-gray-400">{game.pointUnit}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 記録入力フォーム */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">新しい記録</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">日付</label>
              <input
                id="date"
                name="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white"
              />
            </div>
            <div>
              <label htmlFor="rank" className="block text-sm font-medium mb-2">ランク</label>
              <select
                id="rank"
                name="rank"
                value={selectedRank}
                onChange={(e) => setSelectedRank(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white"
              >
                <option value="">ランクを選択</option>
                {(() => {
                  const ranks = getGameRankGroups(selectedGame.id) || []
                  return ranks.map((rank: any) => (
                    <option key={rank.name} value={rank.name}>{rank.name}</option>
                  ))
                })()}
              </select>
            </div>
            {selectedRank && (getGameValidDivisions(selectedGame?.id || '', selectedRank) || []).length > 0 && (
              <div>
                <label htmlFor="division" className="block text-sm font-medium mb-2">エディション</label>
                <select
                  id="division"
                  name="division"
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white"
                >
                  <option value="">エディションを選択</option>
                  {(getGameValidDivisions(selectedGame?.id || '', selectedRank) || []).map((division) => (
                    <option key={division} value={division}>{division}</option>
                  ))}
                </select>
              </div>
            )}
            {isGameRankingBased(selectedRank) && (
              <div>
                <label htmlFor="ranking-position" className="block text-sm font-medium mb-2">順位</label>
                <input
                  id="ranking-position"
                  name="ranking-position"
                  type="number"
                  value={rankingPosition}
                  onChange={(e) => setRankingPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white"
                  placeholder="例: 1500"
                />
              </div>
            )}
            <div>
              <label htmlFor="tier-points" className="block text-sm font-medium mb-2">
                ティア内RP {selectedRank && selectedDivision && `(最大: ${getMaxTierPoints(selectedRank, selectedDivision, selectedGame?.id)})`}
              </label>
              <input
                id="tier-points"
                name="tier-points"
                type="number"
                value={currentTierPoints}
                onChange={(e) => handleTierPointsChange(e.target.value, setCurrentTierPoints, selectedGame, selectedRank, selectedDivision)}
                className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white"
                placeholder={`例: ${selectedGame?.id === 'league-of-legends' || selectedGame?.id === 'valorant' ? '0-100' : selectedRank === 'シルバー' && selectedDivision === 'IV' ? '0-500' : selectedRank === 'シルバー' && selectedDivision === 'I' ? '0-750' : '250'}`}
                min="0"
                max={getMaxTierPoints(selectedRank, selectedDivision, selectedGame?.id)}
              />
              {selectedRank && selectedDivision && (
                <p className="text-xs text-gray-400 mt-1">
                  {selectedGame?.id === 'league-of-legends' || selectedGame?.id === 'valorant' 
                    ? `${selectedGame.name}のティア内RP上限: ${getMaxTierPoints(selectedRank, selectedDivision, selectedGame?.id)}`
                    : `${selectedRank} ${selectedDivision}の上限: ${getMaxTierPoints(selectedRank, selectedDivision, selectedGame?.id)} RP`
                  }
                </p>
              )}
            </div>
            <div>
              <label htmlFor="matches" className="block text-sm font-medium mb-2">マッチ数</label>
              <input
                id="matches"
                name="matches"
                type="number"
                value={matches}
                onChange={(e) => setMatches(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white"
                placeholder="例: 5"
              />
            </div>
            <div>
              <label htmlFor="best-placement" className="block text-sm font-medium mb-2">最高順位</label>
              <input
                id="best-placement"
                name="best-placement"
                type="number"
                value={bestPlacement}
                onChange={(e) => setBestPlacement(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white"
                placeholder="例: 1"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="memo" className="block text-sm font-medium mb-2">振り返りメモ</label>
              <textarea
                id="memo"
                name="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 rounded-lg text-white"
                rows={3}
                placeholder="今日の試合の振り返り..."
              />
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                onClick={saveRecord}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
              >
                記録を保存
              </button>
            </div>
          </div>
        </div>

        {/* 目標設定フォーム - 常に表示 */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">目標を設定</h3>
            <button
              onClick={() => setShowGoalForm(!showGoalForm)}
              className={`p-2 rounded-lg transition-colors ${
                showGoalForm ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-500'
              }`}
            >
              {showGoalForm ? '閉じる' : '開く'}
            </button>
          </div>
          
          {showGoalForm && (
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
                  placeholder="例: 15000"
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
                  placeholder="例: プラチナ"
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
              <div className="md:col-span-2 flex items-end">
                <button
                  onClick={saveGoalSettings}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  目標を保存
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 履歴とグラフ */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">履歴とグラフ</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`p-2 rounded-lg transition-colors ${
                  showAnalytics ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`p-2 rounded-lg transition-colors ${
                  showAnalytics ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {showAnalytics ? '履歴を閉じる' : '履歴を開く'}
              </button>
            </div>
          </div>

          {/* ランクアップ予測 */}
          {latestRecord && (
            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
              <h4 className="text-md font-semibold mb-2">ランクアップ予測</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">現在のランク</p>
                  <p className="text-lg font-bold text-white">
                    {getRank(latestRecord.points).name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">次のランクまで</p>
                  <p className="text-lg font-bold text-green-400">
                    {getRank(latestRecord.points).pointsToNext > 0 
                      ? `${getRank(latestRecord.points).pointsToNext} RP`
                      : '最高ランク'
                    }
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getRank(latestRecord.points).progress * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {Math.round(getRank(latestRecord.points).progress * 100)}% 完了
                </p>
              </div>
            </div>
          )}

          {/* 履歴リスト */}
          <div className="mb-4">
            <h4 className="text-md font-semibold mb-3">履歴</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {gameRecords.slice().reverse().map((record) => (
                <div key={record.id} className="bg-gray-700 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {getRank(record.points).name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(record.date)} {record.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-400">
                        {record.points.toLocaleString()} RP
                      </p>
                      {record.memo && (
                        <p className="text-xs text-gray-400 mt-1">
                          {record.memo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showAnalytics && (
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-md font-semibold mb-3">基本統計</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-600 rounded p-3">
                    <p className="text-sm text-gray-400">記録数</p>
                    <p className="text-2xl font-bold">{gameRecords.length}</p>
                  </div>
                  <div className="bg-gray-600 rounded p-3">
                    <p className="text-sm text-gray-400">現在のRP</p>
                    <p className="text-2xl font-bold">
                      {gameRecords.length > 0 ? gameRecords[gameRecords.length - 1].points.toLocaleString() : '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-md font-semibold mb-3">日次変化</h4>
                <div className="bg-gray-600 rounded p-3">
                  <p className="text-sm text-gray-400">今日の変化</p>
                  <p className={`text-2xl font-bold ${getDailyChange() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {getDailyChange() >= 0 ? '+' : ''}{getDailyChange().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* グラフ */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-md font-semibold mb-3">RP推移グラフ</h4>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#9CA3AF" 
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    tick={{ fill: "#9CA3AF" }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1F2937", 
                      border: "1px solid #374151",
                      borderRadius: "6px"
                    }}
                    labelStyle={{ color: "#F3F4F6" }}
                    formatter={(value: any, name: any) => [
                      `${name}: ${value}`,
                      `RP: ${value?.points || 0}`
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="points" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: "#3B82F6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  {goalLines.map((line, index) => (
                    <ReferenceLine 
                      key={index}
                      y={line.value} 
                      stroke={line.color} 
                      strokeDasharray="5 5" 
                      label={line.label}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('MainContent render error:', error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-400">エラーが発生しました</div>
      </div>
    )
  }
}
