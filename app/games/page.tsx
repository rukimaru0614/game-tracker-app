'use client'

import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Palette, Trophy, Settings } from 'lucide-react'
import Link from 'next/link'
import { useGameData } from '@/hooks/useGameData'
import { Game } from '@/types/game'
import RankTierEditor from '@/components/RankTierEditor'

const PRESET_COLORS = [
  { name: 'レッド', value: '#ef4444' },
  { name: 'ブルー', value: '#3b82f6' },
  { name: 'グリーン', value: '#10b981' },
  { name: 'パープル', value: '#8b5cf6' },
  { name: 'オレンジ', value: '#f97316' },
  { name: 'ピンク', value: '#ec4899' },
  { name: 'イエロー', value: '#eab308' },
  { name: 'グレー', value: '#6b7280' }
]

const PRESET_RANKS = {
  'Apex Legends': [
    { name: 'プレデター', minPoints: 99999, color: 'text-red-600' },
    { name: 'マスター', minPoints: 15000, color: 'text-purple-500' },
    { name: 'ダイヤモンド', minPoints: 11000, color: 'text-blue-500' },
    { name: 'プラチナ', minPoints: 7000, color: 'text-cyan-500' },
    { name: 'ゴールド', minPoints: 3000, color: 'text-yellow-500' },
    { name: 'シルバー', minPoints: 500, color: 'text-gray-400' },
    { name: 'ブロンズ', minPoints: 100, color: 'text-amber-700' },
    { name: 'ルーキー', minPoints: -750, color: 'text-stone-500' }
  ],
  'Valorant': [
    { name: 'イモータル', minPoints: 2100, color: 'text-red-500' },
    { name: 'アセンダント', minPoints: 1800, color: 'text-orange-500' },
    { name: 'ダイヤモンド', minPoints: 1500, color: 'text-blue-500' },
    { name: 'プラチナ', minPoints: 1200, color: 'text-cyan-500' },
    { name: 'ゴールド', minPoints: 900, color: 'text-yellow-500' },
    { name: 'シルバー', minPoints: 600, color: 'text-gray-400' },
    { name: 'ブロンズ', minPoints: 300, color: 'text-amber-700' },
    { name: 'アイアン', minPoints: 0, color: 'text-stone-500' }
  ],
  'League of Legends': [
    { name: 'ダイヤモンド', minPoints: 2400, color: 'text-blue-500' },
    { name: 'エメラルド', minPoints: 2000, color: 'text-green-500' },
    { name: 'プラチナ', minPoints: 1600, color: 'text-cyan-500' },
    { name: 'ゴールド', minPoints: 1200, color: 'text-yellow-500' },
    { name: 'シルバー', minPoints: 800, color: 'text-gray-400' },
    { name: 'ブロンズ', minPoints: 400, color: 'text-amber-700' },
    { name: 'アイアン', minPoints: 0, color: 'text-stone-500' }
  ],
  'Street Fighter 6': [
    { name: 'レジェンド', minPoints: 20000, color: 'text-red-500' },
    { name: 'マスター', minPoints: 15000, color: 'text-purple-500' },
    { name: 'ダイヤモンド', minPoints: 10000, color: 'text-blue-500' },
    { name: 'プラチナ', minPoints: 6000, color: 'text-cyan-500' },
    { name: 'ゴールド', minPoints: 3000, color: 'text-yellow-500' },
    { name: 'シルバー', minPoints: 1500, color: 'text-gray-400' },
    { name: 'ブロンズ', minPoints: 500, color: 'text-amber-700' },
    { name: 'アイアン', minPoints: 0, color: 'text-stone-500' }
  ]
}

export default function GamesPage() {
  const { allGames, selectedGame, selectGame, addGame, removeGame, updateGame } = useGameData()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [newGame, setNewGame] = useState({
    name: '',
    pointUnit: '',
    themeColor: '#3b82f6',
    rankTiers: PRESET_RANKS['Apex Legends']
  })

  const handleAddGame = () => {
    if (!newGame.name || !newGame.pointUnit) return

    // プリセットからランク設定を適用
    let rankTiers = PRESET_RANKS['Apex Legends']
    Object.entries(PRESET_RANKS).forEach(([gameName, ranks]) => {
      if (newGame.name.toLowerCase().includes(gameName.toLowerCase())) {
        rankTiers = ranks
      }
    })

    addGame({
      name: newGame.name,
      pointUnit: newGame.pointUnit,
      themeColor: newGame.themeColor,
      rankTiers
    })

    setNewGame({
      name: '',
      pointUnit: '',
      themeColor: '#3b82f6',
      rankTiers: PRESET_RANKS['Apex Legends']
    })
    setShowAddForm(false)
  }

  const handleRemoveGame = (gameId: string) => {
    if (confirm('このゲームとすべての記録を削除しますか？')) {
      removeGame(gameId)
    }
  }

  const handleEditGame = (game: Game) => {
    setEditingGame(game)
  }

  const handleSaveEdit = () => {
    if (!editingGame) return
    
    updateGame(editingGame.id, {
      rankTiers: editingGame.rankTiers
    })
    
    setEditingGame(null)
  }

  return (
    <div className="flex-1 pb-20">
      <div className="p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/" className="mr-3">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold">ゲーム管理</h1>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {allGames.map((game) => (
            <div
              key={game.id}
              className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-colors ${
                selectedGame.id === game.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-750'
              }`}
              onClick={() => selectGame(game.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: game.themeColor }}
                  />
                  <div>
                    <div className="font-medium">{game.name}</div>
                    <div className="text-sm text-gray-400">単位: {game.pointUnit}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedGame.id === game.id && (
                    <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      選択中
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditGame(game)
                    }}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="ランク設定"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem('hasSeenTutorial')
                      window.location.href = '/'
                    }}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    title="チュートリアルをもう一度見る"
                  >
                    <Trophy className="w-4 h-4" />
                  </button>
                  {game.id !== 'apex-legends' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveGame(game.id)
                      }}
                      className="p-1 text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ゲーム追加フォーム */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">ゲームを追加</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">ゲーム名</label>
                  <input
                    type="text"
                    value={newGame.name}
                    onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                    placeholder="例: Valorant, League of Legends"
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">ポイント単位</label>
                  <input
                    type="text"
                    value={newGame.pointUnit}
                    onChange={(e) => setNewGame({ ...newGame, pointUnit: e.target.value })}
                    placeholder="例: RR, LP, レーティング"
                    className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">テーマカラー</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewGame({ ...newGame, themeColor: color.value })}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          newGame.themeColor === color.value ? 'border-white' : 'border-gray-600'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddGame}
                  disabled={!newGame.name || !newGame.pointUnit}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ランク編集モーダル */}
        {editingGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{editingGame.name} - ラク設定</h2>
                  <p className="text-sm text-gray-400 mt-1">ランクの境界線と色をカスタマイズ</p>
                </div>
                <button
                  onClick={() => setEditingGame(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <RankTierEditor
                rankTiers={editingGame.rankTiers}
                onChange={(rankTiers) => {
                  setEditingGame({ ...editingGame, rankTiers })
                }}
              />
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setEditingGame(null)}
                  className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
