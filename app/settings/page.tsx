'use client'

import { useState } from 'react'
import { ArrowLeft, Trash2, Download, Upload } from 'lucide-react'
import Link from 'next/link'
import { useGameData } from '@/hooks/useGameData'
import { GameRecord } from '@/types/game'

export default function Settings() {
  const { allGames, gameRecords } = useGameData()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const exportData = () => {
    const gameData = {
      games: allGames,
      records: gameRecords
    }
    const dataStr = JSON.stringify(gameData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `game-tracker-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        if (importedData.games && importedData.records) {
          localStorage.setItem('game-tracker-data', JSON.stringify(importedData))
          alert('データをインポートしました。アプリを再読み込みしてください。')
          window.location.reload()
        } else {
          alert('無効なファイル形式です')
        }
      } catch (error) {
        alert('ファイルの読み込みに失敗しました')
      }
    }
    reader.readAsText(file)
  }

  const clearAllData = () => {
    localStorage.removeItem('game-tracker-data')
    localStorage.removeItem('apex-rp-records')
    setShowConfirmDialog(false)
    alert('すべてのデータを削除しました。アプリを再読み込みしてください。')
    window.location.reload()
  }

  return (
    <div className="flex-1 pb-20">
      <div className="p-4 max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-3">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold">設定</h1>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">データ管理</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">記録数</div>
                  <div className="text-sm text-gray-400">{gameRecords.length} 件の記録</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">ゲーム数</div>
                  <div className="text-sm text-gray-400">{allGames.length} ゲーム</div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-3 space-y-2">
                <button
                  onClick={exportData}
                  className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  データをエクスポート
                </button>
                
                <label className="block">
                  <span className="w-full flex items-center justify-center py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    データをインポート
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
                
                <button
                  onClick={() => setShowConfirmDialog(true)}
                  className="w-full flex items-center justify-center py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  すべてのデータを削除
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">アプリ情報</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">バージョン</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">開発者</span>
                <span>IR</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 確認ダイアログ */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">確認</h3>
            <p className="text-gray-300 mb-6">
              すべての記録を削除します。この操作は元に戻せません。よろしいですか？
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={clearAllData}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
