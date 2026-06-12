'use client'

import { useEffect, useState } from 'react'
import { Application, COLUMNS } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function StatsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.json())
      .then((data) => { setApps(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const total = apps.length
  const offers = apps.filter((a) => a.status === 'offer').length
  const rejected = apps.filter((a) => a.status === 'rejected').length
  const active = apps.filter((a) => !['offer', 'rejected'].includes(a.status)).length
  const responseRate = total > 0 ? Math.round(((total - apps.filter((a) => a.status === 'applied').length) / total) * 100) : 0
  const avgScore = (() => {
    const scored = apps.filter((a) => a.ai_score !== undefined && a.ai_score !== null)
    if (!scored.length) return null
    return Math.round(scored.reduce((s, a) => s + (a.ai_score ?? 0), 0) / scored.length)
  })()

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Stats</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Applied', value: total },
          { label: 'Active Pipeline', value: active },
          { label: 'Offers', value: offers },
          { label: 'Response Rate', value: `${responseRate}%` },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI score */}
      {avgScore !== null && (
        <Card className="mb-8 max-w-xs">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">Avg AI Match Score</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-3xl font-bold text-purple-600">{avgScore}%</p>
          </CardContent>
        </Card>
      )}

      {/* Breakdown by stage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Applications by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {COLUMNS.map((col) => {
              const count = apps.filter((a) => a.status === col.id).length
              const pct = total > 0 ? Math.round((count / total) * 100) : 0
              return (
                <div key={col.id} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-gray-600 flex-shrink-0">{col.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className={`${col.color} h-2 rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-sm font-medium text-gray-700 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent applications */}
      {apps.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {apps.slice(0, 8).map((app) => (
                <div key={app.id} className="flex items-center justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="font-medium text-gray-900">{app.company}</span>
                    <span className="text-gray-500 ml-2">{app.role}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.ai_score !== undefined && app.ai_score !== null && (
                      <span className="text-xs text-purple-600 font-medium">{app.ai_score}%</span>
                    )}
                    <span className="text-xs text-gray-400">{app.applied_date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
