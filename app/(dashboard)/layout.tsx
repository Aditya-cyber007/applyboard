'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, BarChart2, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { href: '/board', label: 'Board', icon: LayoutDashboard },
  { href: '/stats', label: 'Stats', icon: BarChart2 },
]

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">ApplyBoard</h1>
          <p className="text-xs text-gray-500">Job tracker</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${pathname === href
                ? 'bg-gray-900 text-white'
                : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <UserButton
          appearance={{
            elements: {
              rootBox: 'w-full',
              userButtonTrigger: 'w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors',
              userButtonAvatarBox: 'h-8 w-8 flex-shrink-0',
              userButtonOuterIdentifier: 'text-sm font-medium text-gray-700 truncate',
            },
          }}
          showName
        />
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-52 flex-shrink-0 bg-white border-r border-gray-200 flex-col">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 w-64 bg-white border-r border-gray-200 flex flex-col">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
          <span className="font-bold text-gray-900">ApplyBoard</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  )
}
