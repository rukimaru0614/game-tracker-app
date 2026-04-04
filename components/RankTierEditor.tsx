'use client'

import { useState } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { RankTier } from '@/types/game'

interface RankTierEditorProps {
  rankTiers: RankTier[]
  onChange: (rankTiers: RankTier[]) => void
}

const PRESET_COLORS = [
  { name: 'レッド', value: 'text-red-500' },
  { name: 'パープル', value: 'text-purple-500' },
  { name: 'ブルー', value: 'text-blue-500' },
  { name: 'シアン', value: 'text-cyan-500' },
  { name: 'イエロー', value: 'text-yellow-500' },
  { name: 'グレー', value: 'text-gray-400' },
  { name: 'ブロンズ', value: 'text-amber-700' },
  { name: 'グリーン', value: 'text-green-500' }
]

export default function RankTierEditor({ rankTiers, onChange }: RankTierEditorProps) {
  const [newTier, setNewTier] = useState({ name: '', minPoints: 0, color: 'text-gray-400' })

  const addRankTier = () => {
    if (!newTier.name) return
    
    const updatedTiers = [...rankTiers, { ...newTier, id: Date.now().toString() }]
      .sort((a, b) => b.minPoints - a.minPoints)
    onChange(updatedTiers)
    setNewTier({ name: '', minPoints: 0, color: 'text-gray-400' })
  }

  const removeRankTier = (index: number) => {
    if (rankTiers.length <= 1) return // 少なくとも1つは必要
    
    const updatedTiers = rankTiers.filter((_, i) => i !== index)
    onChange(updatedTiers)
  }

  const updateRankTier = (index: number, field: keyof RankTier, value: string | number) => {
    const updatedTiers = [...rankTiers]
    updatedTiers[index] = { ...updatedTiers[index], [field]: value }
    onChange(updatedTiers)
  }

  const moveRankTier = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === rankTiers.length - 1)
    ) {
      return
    }

    const updatedTiers = [...rankTiers]
    const newIndex = direction === 'up' ? index - 1 : index + 1
    ;[updatedTiers[index], updatedTiers[newIndex]] = [updatedTiers[newIndex], updatedTiers[index]]
    onChange(updatedTiers)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {rankTiers.map((tier, index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="flex flex-col space-y-1">
                <button
                  onClick={() => moveRankTier(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => moveRankTier(index, 'down')}
                  disabled={index === rankTiers.length - 1}
                  className="p-1 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              
              <div className="flex-1 grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={tier.name}
                  onChange={(e) => updateRankTier(index, 'name', e.target.value)}
                  placeholder="ランク名"
                  className="px-2 py-1 bg-gray-600 rounded text-sm text-white"
                />
                <input
                  type="number"
                  value={tier.minPoints}
                  onChange={(e) => updateRankTier(index, 'minPoints', parseInt(e.target.value) || 0)}
                  placeholder="最低ポイント"
                  className="px-2 py-1 bg-gray-600 rounded text-sm text-white"
                />
                <select
                  value={tier.color}
                  onChange={(e) => updateRankTier(index, 'color', e.target.value)}
                  className="px-2 py-1 bg-gray-600 rounded text-sm text-white"
                >
                  {PRESET_COLORS.map((color) => (
                    <option key={color.value} value={color.value}>
                      {color.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={`px-2 py-1 rounded text-sm font-medium ${tier.color}`}>
                プレビュー
              </div>
              
              {rankTiers.length > 1 && (
                <button
                  onClick={() => removeRankTier(index)}
                  className="p-1 text-red-500 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="mt-2 text-xs text-gray-400">
              {tier.minPoints} {tier.name}以上
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-600 pt-4">
        <h4 className="text-sm font-medium mb-2">新しいランクを追加</h4>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newTier.name}
            onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
            placeholder="ランク名"
            className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm text-white"
          />
          <input
            type="number"
            value={newTier.minPoints}
            onChange={(e) => setNewTier({ ...newTier, minPoints: parseInt(e.target.value) || 0 })}
            placeholder="最低ポイント"
            className="w-24 px-2 py-1 bg-gray-700 rounded text-sm text-white"
          />
          <select
            value={newTier.color}
            onChange={(e) => setNewTier({ ...newTier, color: e.target.value })}
            className="px-2 py-1 bg-gray-700 rounded text-sm text-white"
          >
            {PRESET_COLORS.map((color) => (
              <option key={color.value} value={color.value}>
                {color.name}
              </option>
            ))}
          </select>
          <button
            onClick={addRankTier}
            disabled={!newTier.name}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
