import React from 'react'
import { TrendingUp, TrendingDown, Minus, Target, Trophy, BarChart3 } from 'lucide-react'
import { AnalyticsData } from '@/utils/analytics'

interface AnalyticsCardProps {
  data: AnalyticsData
  className?: string
}

export function AnalyticsCard({ data, className = '' }: AnalyticsCardProps) {
  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-400" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving':
        return 'text-green-400'
      case 'declining':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          パフォーマンス分析
        </h2>
      </div>

      {/* PC: 横並び, スマホ: 縦並び */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 平均順位 */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">平均順位</span>
          </div>
          <div className="text-xl font-bold text-white">
            {data.averagePlacement > 0 ? `${data.averagePlacement}位` : '-'}
          </div>
          {data.averagePlacement > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              {data.averagePlacement <= 3 ? 'トップクラス' : data.averagePlacement <= 10 ? '良い順位' : '改善の余地'}
            </div>
          )}
        </div>

        {/* 昇格予測 */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">昇格予測</span>
          </div>
          <div className="text-lg font-bold text-white">
            {data.promotionPrediction.targetRank}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            残り {data.promotionPrediction.pointsNeeded.toLocaleString()} RP
          </div>
          <div className="text-xs text-blue-400 mt-1">
            約 {data.promotionPrediction.estimatedGames} 試合
          </div>
        </div>

        {/* パフォーマンストレンド */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            {getTrendIcon(data.performanceTrend.trend)}
            <span className="text-xs text-gray-400">トレンド</span>
          </div>
          <div className={`text-lg font-bold ${getTrendColor(data.performanceTrend.trend)}`}>
            {data.performanceTrend.trend === 'improving' ? '上昇中' : 
             data.performanceTrend.trend === 'declining' ? '下降中' : '安定'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            変化率 {Math.abs(data.performanceTrend.changeRate)}%
          </div>
        </div>

        {/* 目標進捗 */}
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">目標進捗</span>
          </div>
          <div className="text-lg font-bold text-white">
            {data.goalProgress.progressPercentage}%
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${data.goalProgress.progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {data.goalProgress.currentRP.toLocaleString()} / {data.goalProgress.goalRP.toLocaleString()} RP
          </div>
        </div>
      </div>

      {/* 詳細統計 - スマホでは折りたたみ可能 */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 最近5ゲームの順位 */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">最近5ゲーム</h3>
            <div className="flex space-x-2">
              {data.performanceTrend.last5Games.length > 0 ? (
                data.performanceTrend.last5Games.map((placement, index) => (
                  <div 
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      placement <= 3 ? 'bg-yellow-500 text-black' :
                      placement <= 10 ? 'bg-blue-500 text-white' :
                      'bg-gray-600 text-white'
                    }`}
                  >
                    {placement}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-400">データなし</div>
              )}
            </div>
          </div>

          {/* 目標までの詳細 */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">目標詳細</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">現在のRP:</span>
                <span className="text-white">{data.promotionPrediction.currentRP.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">目標RP:</span>
                <span className="text-white">{data.promotionPrediction.targetRP.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">必要RP:</span>
                <span className="text-blue-400">{data.promotionPrediction.pointsNeeded.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
