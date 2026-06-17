'use client'

import { useDroppable } from '@dnd-kit/core'
import { Application, Status } from '@/lib/types'
import { ApplicationCard } from './ApplicationCard'

interface Props {
  id: Status
  label: string
  color: string
  applications: Application[]
  onDelete: (id: string) => void
  onAnalyze: (app: Application) => void
}

export function KanbanColumn({ id, label, color, applications, onDelete, onAnalyze }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="flex flex-col min-w-0">
      {/* Column header */}
      <div className={`${color} text-white px-3 py-1.5 rounded-t-lg flex items-center justify-between`}>
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 font-medium">
          {applications.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-40 rounded-b-lg p-2 transition-colors overflow-y-auto
          ${isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed border-t-0' : 'bg-gray-100'}`}
      >
        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            app={app}
            onDelete={onDelete}
            onAnalyze={onAnalyze}
          />
        ))}

        {applications.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-6">Drop here</p>
        )}
      </div>
    </div>
  )
}
