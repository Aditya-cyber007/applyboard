'use client'

import { useDraggable } from '@dnd-kit/core'
import { Application } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Sparkles, ExternalLink } from 'lucide-react'

interface Props {
  app: Application
  onDelete: (id: string) => void
  onAnalyze: (app: Application) => void
}

export function ApplicationCard({ app, onDelete, onAnalyze }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg p-3 mb-2 shadow-sm border border-gray-200 select-none
        ${isDragging ? 'opacity-40 shadow-lg rotate-1' : 'hover:shadow-md transition-shadow'}`}
    >
      {/* Drag handle — only this area initiates drag */}
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing mb-2"
      >
        <p className="font-semibold text-sm text-gray-900 leading-tight">{app.company}</p>
        <p className="text-xs text-gray-500 mt-0.5">{app.role}</p>
        {app.location && (
          <p className="text-xs text-gray-400 mt-0.5">{app.location}</p>
        )}
      </div>

      {/* Salary row + actions */}
      <div className="flex items-center justify-between mt-2">
        {app.salary
          ? <span className="text-xs text-gray-400 truncate mr-2">{app.salary}</span>
          : <span />
        }
        <div className="flex items-center gap-1 flex-shrink-0">
          {app.job_url && (
            <a href={app.job_url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </Button>
            </a>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(app.id)}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* AI score badge on its own line so it never collides with salary */}
      {app.ai_score !== undefined && app.ai_score !== null && (
        <div className="mt-1.5">
          <Badge
            variant="outline"
            className={`text-xs font-bold ${
              app.ai_score >= 70
                ? 'border-green-400 text-green-700 bg-green-50'
                : app.ai_score >= 40
                ? 'border-yellow-400 text-yellow-700 bg-yellow-50'
                : 'border-red-400 text-red-700 bg-red-50'
            }`}
          >
            {app.ai_score}% match
          </Badge>
        </div>
      )}

      {app.notes && (
        <p className="text-xs text-gray-400 mt-2 line-clamp-2 border-t border-gray-100 pt-2">
          {app.notes}
        </p>
      )}

      {/* Prominent AI analyze button */}
      <button
        onClick={() => onAnalyze(app)}
        className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-md
          bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300
          text-purple-700 text-xs font-medium py-1.5 transition-colors"
      >
        <Sparkles className="h-3 w-3" />
        AI Match
      </button>
    </div>
  )
}
