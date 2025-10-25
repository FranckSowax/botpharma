'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    { href: '/dashboard', icon: '📊', label: 'Dashboard' },
    { href: '/dashboard/products', icon: '📦', label: 'Produits' },
    { href: '/dashboard/conversations', icon: '💬', label: 'Conversations' },
    { href: '/dashboard/orders', icon: '🛒', label: 'Commandes' },
    { href: '/dashboard/customers', icon: '👥', label: 'Clients' },
    { href: '/dashboard/analytics', icon: '📈', label: 'Analytiques' },
    { href: '/dashboard/automation', icon: '🤖', label: 'Automations' },
    { href: '/dashboard/settings', icon: '⚙️', label: 'Paramètres' },
  ]

  return (
    <aside className="w-64 min-h-screen bg-white shadow-lg border-r border-gray-200">
      <div className="p-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">BOT PHARMA</h1>
            <p className="text-xs text-gray-500">Léa Assistant</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive(item.href)
                  ? 'text-white bg-gradient-to-r from-green-500 to-emerald-600'
                  : 'text-gray-700 hover:bg-green-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
              {!isActive(item.href) && (
                <span className="ml-auto text-xs">→</span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
