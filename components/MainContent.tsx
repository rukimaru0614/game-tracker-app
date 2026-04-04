'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, AlertCircle, Trophy, Target, TrendingUp, Calendar, BarChart3, Users, Zap } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useGameData } from '../hooks/useGameData'
import { type GameRecord } from '../types/game'
import { calculateRankFromTotalRP } from '../utils/unifiedRankCalculator'
import { getGameRankGroups, isGameRankingBased, getGameValidDivisions } from '../utils/gameUtils'
import { getGameRankThresholds } from '../utils/rankThresholds'
import { calculateAnalyticsData, type AnalyticsData } from '../utils/analyticsCalculator'
import { getGoalLines, type GoalLine } from '../utils/goalLines'
import { type Game } from '../types/game'

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
  
  // useEffect 完了まで何も出さない旗
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])
  
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

  // グラフ期間フィルターの型
type GraphPeriod = 'week' | 'month' | 'all'

// グラフデータの型
interface GraphDataPoint {
  timestamp: number
  date: string
  time: string
  points: number
  rank: string
  division?: string
}

// 選択されたデータポイントの状態
const [selectedDataPoint, setSelectedDataPoint] = useState<GraphDataPoint | null>(null)

// グラフ期間フィルター
const [graphPeriod, setGraphPeriod] = useState<GraphPeriod>('week')

// グラフデータをフィルタリングする関数
const getFilteredGraphData = (): GraphDataPoint[] => {
  if (!gameRecords || gameRecords.length === 0) return []
  
  const now = new Date()
  let startDate: Date
  
  switch (graphPeriod) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'all':
    default:
      startDate = new Date(0) // すべてのデータ
      break
  }
  
  return gameRecords
    .filter(record => new Date(record.timestamp) >= startDate)
    .sort((a, b) => a.timestamp - b.timestamp)
    .map(record => ({
      timestamp: record.timestamp,
      date: record.date,
      time: record.time,
      points: record.points,
      rank: record.currentTier,
      division: record.division
    }))
}

// SVGパスを生成する関数
const generateLinePath = (data: GraphDataPoint[], width: number, height: number): string => {
  if (data.length === 0) return ''
  
  const maxPoints = Math.max(...data.map(d => d.points))
  const minPoints = Math.min(...data.map(d => d.points))
  const range = maxPoints - minPoints || 1
  
  const padding = 40
  const graphWidth = width - padding * 2
  const graphHeight = height - padding * 2
  
  return data.map((point, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * graphWidth
    const y = padding + (1 - (point.points - minPoints) / range) * graphHeight
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
}
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

// ティア内RPの入力検証
const handleTierPointsChange = (value: string) => {
  const numValue = parseInt(value) || 0
  const maxPoints = getMaxTierPoints(selectedRank, selectedDivision, selectedGame?.id)
  
  if (maxPoints > 0 && numValue > maxPoints) {
    // 上限を超えた場合は警告して最大値に設定
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

  // useEffect 完了まで何も出さない - ブラウザの準備が100%整うまでローディング画面以外は一切描画させない
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 100) // 100ms待機して確実にマウントさせる
    return () => clearTimeout(timer)
  }, [])

  // データ洗浄と重複削除（初回読み込み時のみ実行）- 超緊急クリーンアップ
  useEffect(() => {
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
          
          // ゲームごとの目標設定を初期化
          const gamesWithGoals = gameData.games || []
          const goalSettingsMap: { [key: string]: GoalSettings } = {}
          
          gamesWithGoals.forEach((game: any) => {
            goalSettingsMap[game.id] = gameData.goalSettings?.[game.id] || {
              targetRP: 0,
              targetRank: '',
              deadline: '',
              isActive: false
            }
          })
          
          // クリーンアップしたデータで保存
          const cleanedData = {
            games: gameData.games || [],
            records: finalRecords,
            selectedGameId: gameData.selectedGameId || 'apex-legends',
            goalSettings: gameData.goalSettings || {
              targetRP: 0,
              targetRank: '',
              deadline: '',
              isActive: false
            },
            goalSettingsMap
          }
          
          localStorage.setItem('gameData', JSON.stringify(cleanedData))
          
          // 目標設定を復元
          if (gameData.goalSettings) {
            setGoalSettings(gameData.goalSettings)
          }
          
          console.log('🧹 Data cleanup completed:', {
            original: gameData.records.length,
            filtered: filteredRecords.length,
            final: finalRecords.length
          })
        }
      } else {
        // データがない場合は初期化
        const initialData = {
          games: [],
          records: [],
          selectedGameId: 'apex-legends',
          goalSettings: {
            targetRP: 0,
            targetRank: '',
            deadline: '',
            isActive: false
          },
          goalSettingsMap: {}
        }
        localStorage.setItem('gameData', JSON.stringify(initialData))
      }
    } catch (error) {
      console.error('データ読み込みエラー:', error)
      // エラー時は初期化
      const initialData = {
        games: [],
        records: [],
        selectedGameId: 'apex-legends',
        goalSettings: {
          targetRP: 0,
          targetRank: '',
          deadline: '',
          isActive: false
        },
        goalSettingsMap: {}
      }
      localStorage.setItem('gameData', JSON.stringify(initialData))
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
    try {
      console.log('🎯 Saving goal settings for game:', selectedGame?.id)
      console.log('🎯 Current goal settings:', goalSettings)
      
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
        
        console.log('🎯 Updated gameData:', gameData)
        localStorage.setItem('gameData', JSON.stringify(gameData))
        console.log('🎯 Game data saved to localStorage')
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
        console.log('🎯 Created initial data:', initialData)
        localStorage.setItem('gameData', JSON.stringify(initialData))
        console.log('🎯 Initial game data saved to localStorage')
      }
      
      // 別のlocalStorageにも保存（互換性のため）
      localStorage.setItem('goalSettings', JSON.stringify(updatedGoalSettings))
      console.log('🎯 Goal settings saved to localStorage')
      
      setShowGoalForm(false)
      alert('目標を保存しました！')
    } catch (error) {
      console.error('目標の保存に失敗しました:', error)
      alert('目標の保存に失敗しました')
    }
  }

  // 目標設定の読み込み
  useEffect(() => {
    console.log('🎯 Loading goal settings for game:', selectedGame?.id)
    
    // まずlocalStorageから全体設定を読み込み
    const stored = localStorage.getItem('goalSettings')
    if (stored) {
      const globalGoal = JSON.parse(stored)
      console.log('🎯 Global goal settings:', globalGoal)
      setGoalSettings(globalGoal)
    }
    
    // gameDataからゲームごとの目標設定を読み込み（優先）
    const gameDataStored = localStorage.getItem('gameData')
    if (gameDataStored) {
      try {
        const gameData = JSON.parse(gameDataStored)
        console.log('🎯 Game data loaded:', gameData)
        
        // ゲームごとの目標設定を読み込み
        if (gameData.goalSettingsMap && selectedGame) {
          const gameSpecificGoal = gameData.goalSettingsMap[selectedGame.id]
          console.log('🎯 Game specific goal for', selectedGame.id, ':', gameSpecificGoal)
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
            console.log('🎯 Using default goal for', selectedGame.id, ':', defaultGoal)
            setGoalSettings(defaultGoal)
          }
        } else if (gameData.goalSettings) {
          // 互換性のための全体目標設定
          console.log('🎯 Using compatibility goal settings:', gameData.goalSettings)
          setGoalSettings(gameData.goalSettings)
        }
      } catch (error) {
        console.error('gameData読み込みエラー:', error)
      }
    }
  }, [selectedGame])

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
      // デバッグ用に現在の選択状態をログ出力
      console.log('🔍 Debug saveRecord:', {
        selectedRank,
        selectedDivision,
        currentTierPoints,
        selectedGame: selectedGame.id
      })

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
        matches: parseInt(matches) || 0,
        bestPlacement: parseInt(bestPlacement) || 0,
        timestamp: Date.now()
      }

      console.log('🔍 Debug newRecord:', newRecord)

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
    
    console.log('🔍 Debug calculateTotalPoints:', {
      selectedRank,
      selectedGame: selectedGame.id
    })
    
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
    
    console.log('🔍 Debug thresholds:', {
      thresholds: thresholds.map(t => t.name),
      matchedRank,
      rankThreshold
    })
    
    if (!rankThreshold) {
      console.log('🔍 No rankThreshold found, returning 0')
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
    
    console.log('🔍 Debug totalPoints:', totalPoints)
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
    return calculateSafeAnalyticsData(gameRecords || [], goalSettings?.targetRP || 0)
  }, [gameRecords, goalSettings?.targetRP])
  const goalLines = useMemo(() => getGoalLines(gameRecords.length), [gameRecords.length])
  
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-400">読み込み中...</div>
      </div>
    )
  }

  try {
    // 2段構え - データが1ミリでも不完全ならLoading表示
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
    console.log('🔍 Debug: selectedGame:', selectedGame)
    console.log('🔍 Debug: gameRecords:', gameRecords)
    console.log('🔍 Debug: gameRecords.length:', gameRecords.length)
    
    return (
      <div className="flex flex-col gap-4 w-full min-h-screen pb-32">
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
                    ティア内: {Number(currentRank?.tierPoints || 0).toLocaleString()} / {Number(currentRank?.maxPoints || 0).toLocaleString()} {selectedGame.pointUnit || 'RP'}
                  </div>
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
          
          {/* 記録入力フォーム */}
          <div className="mb-4 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-md font-semibold mb-3">記録を入力</h3>
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
                  {selectedGame && (getGameRankGroups(selectedGame.id) || []).map((rank: any) => (
                    <option key={rank.name} value={rank.name}>{rank.name}</option>
                  ))}
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
                  onChange={(e) => handleTierPointsChange(e.target.value)}
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
          <div className="mb-4 p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-md font-semibold">目標を設定</h3>
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
            )}
          </div>
        </div>

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

        {/* グラフ表示 */}
        <div className="my-6 bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">RP推移グラフ</h3>
            <div className="flex items-center space-x-2">
              {/* 期間フィルター */}
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setGraphPeriod('week')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    graphPeriod === 'week' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  1週間
                </button>
                <button
                  onClick={() => setGraphPeriod('month')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    graphPeriod === 'month' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  3ヶ月
                </button>
                <button
                  onClick={() => setGraphPeriod('all')}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    graphPeriod === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  全期間
                </button>
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
          
          {/* 選択されたデータポイントの詳細表示 */}
          {selectedDataPoint && (
            <div className="mb-4 bg-gray-700 rounded-lg p-3 border-l-4 border-yellow-400">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">選択された記録</div>
                  <div className="text-lg font-semibold text-white">
                    {selectedDataPoint.date} {selectedDataPoint.time}
                  </div>
                  <div className="text-sm text-gray-300">
                    ランク: {selectedDataPoint.rank} {selectedDataPoint.division || ''}
                  </div>
                  <div className="text-lg font-bold text-blue-400">
                    {selectedDataPoint.points.toLocaleString()} RP
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDataPoint(null)}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {showAnalytics && (
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="h-[32rem] relative">
                {getFilteredGraphData().length > 0 ? (
                  <svg width="100%" height="100%" viewBox="0 0 800 512" className="w-full h-full">
                    {/* グリッド線 */}
                    <defs>
                      <pattern id="grid" width="80" height="64" patternUnits="userSpaceOnUse">
                        <path d="M 80 0 L 0 0 0 64" fill="none" stroke="#374151" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* 目標ライン */}
                    {goalSettings?.targetRP > 0 && (() => {
                      const data = getFilteredGraphData()
                      const maxPoints = Math.max(...data.map(d => d.points))
                      const minPoints = Math.min(...data.map(d => d.points))
                      const range = maxPoints - minPoints || 1
                      const y = 64 + (1 - (goalSettings.targetRP - minPoints) / range) * 384
                      return (
                        <g>
                          <line
                            x1="40"
                            y1={y}
                            x2="760"
                            y2={y}
                            stroke="#fbbf24"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                          />
                          <text
                            x="50"
                            y={y - 5}
                            fill="#fbbf24"
                            fontSize="12"
                            className="bg-gray-800"
                          >
                            目標: {goalSettings.targetRP}RP
                          </text>
                        </g>
                      )
                    })()}
                    
                    {/* 現在RPライン */}
                    {latestRecord && (() => {
                      const data = getFilteredGraphData()
                      const maxPoints = Math.max(...data.map(d => d.points))
                      const minPoints = Math.min(...data.map(d => d.points))
                      const range = maxPoints - minPoints || 1
                      const y = 64 + (1 - (latestRecord.points - minPoints) / range) * 384
                      return (
                        <g>
                          <line
                            x1="40"
                            y1={y}
                            x2="760"
                            y2={y}
                            stroke="#10b981"
                            strokeWidth="2"
                          />
                          <text
                            x="760"
                            y={y - 5}
                            fill="#10b981"
                            fontSize="12"
                            textAnchor="end"
                          >
                            現在: {latestRecord.points}RP
                          </text>
                        </g>
                      )
                    })()}
                    
                    {/* 折れ線グラフ */}
                    {(() => {
                      const data = getFilteredGraphData()
                      if (data.length === 0) return null
                      
                      const path = generateLinePath(data, 800, 512)
                      
                      return (
                        <g>
                          {/* 折れ線 */}
                          <path
                            d={path}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          
                          {/* データポイント */}
                          {data.map((point, index) => {
                            const maxPoints = Math.max(...data.map(d => d.points))
                            const minPoints = Math.min(...data.map(d => d.points))
                            const range = maxPoints - minPoints || 1
                            const x = 40 + (index / (data.length - 1 || 1)) * 720
                            const y = 64 + (1 - (point.points - minPoints) / range) * 384
                            const isSelected = selectedDataPoint?.timestamp === point.timestamp
                            
                            return (
                              <g key={`point-${point.timestamp}-${index}`}>
                                <circle
                                  cx={x}
                                  cy={y}
                                  r={isSelected ? "6" : "4"}
                                  fill={isSelected ? "#fbbf24" : "#3b82f6"}
                                  stroke="#1f2937"
                                  strokeWidth="2"
                                  className="cursor-pointer hover:fill-blue-400 transition-colors"
                                  onClick={() => setSelectedDataPoint(point)}
                                />
                                <title>
                                  {point.date} {point.time}: {point.points}RP ({point.rank})
                                </title>
                              </g>
                            )
                          })}
                        </g>
                      )
                    })()}
                    
                    {/* 軸ラベル */}
                    <g>
                      {/* Y軸ラベル */}
                      {(() => {
                        const data = getFilteredGraphData()
                        if (data.length === 0) return null
                        
                        const maxPoints = Math.max(...data.map(d => d.points))
                        const minPoints = Math.min(...data.map(d => d.points))
                        const range = maxPoints - minPoints || 1
                        
                        return [0, 1, 2, 3, 4].map(i => {
                          const value = minPoints + (range * (4 - i) / 4)
                          const y = 64 + (i / 4) * 384
                          return (
                            <g key={i}>
                              <line
                                x1="35"
                                y1={y}
                                x2="40"
                                y2={y}
                                stroke="#6b7280"
                                strokeWidth="1"
                              />
                              <text
                                x="30"
                                y={y + 4}
                                fill="#6b7280"
                                fontSize="12"
                                textAnchor="end"
                              >
                                {Math.round(value).toLocaleString()}
                              </text>
                            </g>
                          )
                        })
                      })()}
                      
                      {/* X軸ラベル */}
                      {(() => {
                        const data = getFilteredGraphData()
                        return data.map((point, index) => {
                          if (index % Math.ceil(data.length / 8) !== 0) return null
                          
                          const x = 40 + (index / (data.length - 1 || 1)) * 720
                          const date = new Date(point.timestamp)
                          const label = date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
                          
                          return (
                            <g key={`label-${point.timestamp}-${index}`}>
                              <text
                                x={x}
                                y="492"
                                fill="#6b7280"
                                fontSize="10"
                                textAnchor="middle"
                              >
                                {label}
                              </text>
                            </g>
                          )
                        })
                      })()}
                    </g>
                  </svg>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>データがありません</p>
                      <p className="text-sm mt-1">記録を入力してください</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    // エラーが起きたら白い画面で止まらせない
    console.error('MainContent error:', error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-400">エラーが発生しました</div>
      </div>
    )
  }
}
