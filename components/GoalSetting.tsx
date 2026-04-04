import React, { useState, useEffect } from 'react'
import { Target, Save, AlertCircle } from 'lucide-react'

interface GoalSettingProps {
  currentRP: number
  onGoalChange: (goalRP: number) => void
  className?: string
  pointUnit: string
}

export function GoalSetting({ currentRP, onGoalChange, className = '', pointUnit }: GoalSettingProps) {
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // localStorageから目標値を読み込み
  useEffect(() => {
    const savedGoal = localStorage.getItem('game-tracker-goal-rp')
    if (savedGoal) {
      const goal = parseInt(savedGoal)
      if (!isNaN(goal) && goal > 0) {
        setInputValue(goal.toString())
        onGoalChange(goal)
      }
    } else {
      // デフォルト値を設定
      const defaultGoal = Math.max(currentRP + 2000, 8000)
      setInputValue(defaultGoal.toString())
      onGoalChange(defaultGoal)
    }
  }, [currentRP, onGoalChange])

  const validateAndSave = () => {
    const value = inputValue.trim()
    
    // 空文字チェック
    if (!value) {
      setError('目標数値を入力してください')
      return
    }
    
    // 数字チェック
    const numValue = parseInt(value)
    if (isNaN(numValue) || numValue <= 0) {
      setError('有効な数値を入力してください')
      return
    }
    
    // 現在RPより低い場合の警告
    if (numValue <= currentRP) {
      setError('目標は現在のRPより高い値を設定してください')
      return
    }
    
    // 保存と同期
    localStorage.setItem('game-tracker-goal-rp', numValue.toString())
    onGoalChange(numValue)
    setError('')
    setIsEditing(false)
    
    console.log(`目標RPを更新: ${numValue} ${pointUnit}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateAndSave()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setError('')
    }
  }

  const currentGoal = parseInt(inputValue) || 0
  const progressPercentage = currentRP > 0 && currentGoal > 0 ? Math.min(100, Math.round((currentRP / currentGoal) * 100)) : 0

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Target className="w-5 h-5 mr-2 text-red-400" />
          目標設定
        </h3>
        <div className="text-sm text-gray-400">
          現在: {currentRP.toLocaleString()} {pointUnit}
        </div>
      </div>

      {/* PC: 横並び, スマホ: 縦並び */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 入力エリア */}
        <div className="space-y-3">
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onBlur={validateAndSave}
                  placeholder={`例: 10000`}
                  className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  autoFocus
                />
                <button
                  onClick={validateAndSave}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-1" />
                  保存
                </button>
              </div>
              {error && (
                <div className="flex items-center space-x-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
              <div className="text-xs text-gray-400">
                Enterで保存、Escでキャンセル
              </div>
            </div>
          ) : (
            <div 
              onClick={() => setIsEditing(true)}
              className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors min-h-[60px] flex items-center"
            >
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-1">目標 {pointUnit}</div>
                <div className="text-xl font-bold text-white">
                  {currentGoal.toLocaleString()} {pointUnit}
                </div>
              </div>
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* 進捗表示エリア */}
        <div className="space-y-3">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">進捗率</span>
              <span className="text-2xl font-bold text-white">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-red-500 to-red-400 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-400">
              あと {Math.max(0, currentGoal - currentRP).toLocaleString()} {pointUnit}
            </div>
          </div>
        </div>
      </div>

      {/* 単位切り替え */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400">
            単位: {pointUnit} ({pointUnit === 'RP' ? 'Rank Points' : 'League Points'})
          </div>
          <div className="text-xs text-gray-500">
            クリックして目標を編集できます
          </div>
        </div>
      </div>
    </div>
  )
}
