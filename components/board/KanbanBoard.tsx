'use client'

import { useEffect, useState } from 'react'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useBoardStore } from '@/lib/store'
import { Application, COLUMNS, Status } from '@/lib/types'
import { KanbanColumn } from './KanbanColumn'
import { AddApplicationModal } from './AddApplicationModal'
import { AnalyzeModal } from './AnalyzeModal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function KanbanBoard() {
  const { applications, setApplications, updateApplication, removeApplication } = useBoardStore()
  const [addOpen, setAddOpen] = useState(false)
  const [analyzeApp, setAnalyzeApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  // Pointer sensor with a small activation distance to distinguish click vs drag
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.json())
      .then((data) => { setApplications(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [setApplications])

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over) return
    const newStatus = over.id as Status
    const appId = active.id as string
    const app = applications.find((a) => a.id === appId)
    if (!app || app.status === newStatus) return

    // Optimistic update
    updateApplication(appId, { status: newStatus })

    // Persist to DB
    fetch(`/api/applications/${appId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => {
      // Revert on failure
      updateApplication(appId, { status: app.status })
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this application?')) return
    removeApplication(id)
    await fetch(`/api/applications/${id}`, { method: 'DELETE' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading your applications...
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Board</h1>
          <p className="text-sm text-gray-500 mt-0.5">{applications.length} total applications</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Application
        </Button>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              color={col.color}
              applications={applications.filter((a) => a.status === col.id)}
              onDelete={handleDelete}
              onAnalyze={setAnalyzeApp}
            />
          ))}
        </div>
      </DndContext>

      <AddApplicationModal open={addOpen} onClose={() => setAddOpen(false)} />
      <AnalyzeModal app={analyzeApp} onClose={() => setAnalyzeApp(null)} />
    </div>
  )
}
