import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, BarChart2 } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">ApplyBoard</h1>
          <p className="text-xs text-gray-500">Job tracker</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          <Link
            href="/board"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Board
          </Link>
          <Link
            href="/stats"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <BarChart2 className="h-4 w-4" />
            Stats
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <UserButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
