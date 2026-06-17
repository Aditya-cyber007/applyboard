'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useBoardStore } from '@/lib/store'
import { Application, COLUMNS, Status } from '@/lib/types'
import { KanbanColumn } from './KanbanColumn'
import { AddApplicationModal } from './AddApplicationModal'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

// Lazy-load the heavy AnalyzeModal (pulls in pdfjs-dist ~3 MB) only when opened
const AnalyzeModal = dynamic(
  () => import('./AnalyzeModal').then((m) => ({ default: m.AnalyzeModal })),
  { ssr: false }
)

const DEMO_APPLICATIONS = [
  { company: 'Google', role: 'Senior Frontend Engineer', status: 'applied', location: 'Bangalore, India', salary: '₹45–55 LPA', job_url: 'https://careers.google.com', notes: 'Applied via referral from ex-colleague Priya.' },
  { company: 'Microsoft', role: 'Software Engineer II', status: 'screening', location: 'Hyderabad, India', salary: '₹35–42 LPA', job_url: 'https://careers.microsoft.com', notes: 'HR called, scheduled intro call for next week.' },
  { company: 'Flipkart', role: 'Staff Engineer', status: 'technical', location: 'Bangalore, India', salary: '₹40–50 LPA', notes: 'System design round scheduled. Revise distributed systems.' },
  { company: 'Razorpay', role: 'Frontend Architect', status: 'final', location: 'Remote', salary: '₹38–45 LPA', job_url: 'https://razorpay.com/jobs', notes: 'Final round with VP Eng. Strong signal from recruiter.' },
  { company: 'Zepto', role: 'React Native Lead', status: 'offer', location: 'Mumbai, India', salary: '₹32–38 LPA', notes: 'Offer letter received. Negotiating stock options.' },
  { company: 'Swiggy', role: 'Senior React Developer', status: 'rejected', location: 'Bangalore, India', salary: '₹28–35 LPA', notes: 'Rejected after round 2. Feedback: needed more system design depth.' },
  { company: 'Meesho', role: 'Tech Lead - Web', status: 'applied', location: 'Bangalore, India', salary: '₹30–38 LPA', notes: 'Applied directly on LinkedIn.' },
  { company: 'PhonePe', role: 'Principal Engineer', status: 'screening', location: 'Bangalore, India', salary: '₹50–60 LPA', notes: 'Recruiter outreach on LinkedIn.' },
] as const

export function KanbanBoard() {
  const { applications, setApplications, addApplication, updateApplication, removeApplication } = useBoardStore()
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

  function handleDelete(id: string) {
    const app = applications.find((a) => a.id === id)
    toast('Delete this application?', {
      description: app ? `${app.company} — ${app.role}` : undefined,
      action: {
        label: 'Delete',
        onClick: async () => {
          removeApplication(id)
          await fetch(`/api/applications/${id}`, { method: 'DELETE' })
          toast.success('Application deleted')
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    })
  }

  async function loadDemoData() {
    setLoading(true)
    try {
      for (const demo of DEMO_APPLICATIONS) {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(demo),
        })
        if (res.ok) {
          const data = await res.json()
          addApplication(data)
        }
      }
      toast.success('Demo data loaded — 8 sample applications added')
    } catch {
      toast.error('Failed to load some demo applications')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Loading your applications...
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Board</h1>
          <p className="text-sm text-gray-500 mt-0.5">{applications.length} total applications</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Application</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Empty state — offer demo seed */}
      {applications.length === 0 && (
        <div className="mt-6 rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center">
          <Sparkles className="h-8 w-8 text-purple-400 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-gray-700 mb-1">No applications yet</h2>
          <p className="text-sm text-gray-500 mb-4">
            Add your first job or load sample data to see how the board looks.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Application
            </Button>
            <Button variant="outline" onClick={loadDemoData} className="gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Load Demo Data
            </Button>
          </div>
        </div>
      )}

      {/* Kanban grid — 1 col mobile → 2 col tablet → 3 col laptop → 6 col wide desktop */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3 mt-6">
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
