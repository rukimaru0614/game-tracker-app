'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, History, Settings, Gamepad2 } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'ホーム', icon: Home },
    { href: '/history', label: '履歴', icon: History },
    { href: '/games', label: 'ゲーム', icon: Gamepad2 },
    { href: '/settings', label: '設定', icon: Settings },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-40">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-blue-500' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
      <div className="bg-gray-900 border-t border-gray-700 px-4 py-2 text-center">
        <p className="text-xs text-gray-500">
          本アプリは個人開発の非公式ツールです。LoL, スト6, Apex, Valorantの各運営会社様とは一切関係ありません。
        </p>
      </div>
    </nav>
  )
}
