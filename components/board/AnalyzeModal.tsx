'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Application } from '@/lib/types'
import { useBoardStore } from '@/lib/store'
import { Sparkles } from 'lucide-react'

interface Props {
  app: Application | null
  onClose: () => void
}

interface AnalysisResult {
  score: number
  gaps: string[]
  summary: string
  company: string
  role: string
  salary: string
  location: string
}

export function AnalyzeModal({ app, onClose }: Props) {
  const updateApplication = useBoardStore((s) => s.updateApplication)
  const [jd, setJd] = useState('')
  const [resume, setResume] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  async function handleAnalyze() {
    if (!app || !jd.trim() || !resume.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jd, resumeText: resume }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)

      // Save AI result back to the application
      await fetch(`/api/applications/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_score: data.score,
          ai_gaps: data.gaps,
          ai_summary: data.summary,
          ...(data.company && { company: data.company }),
          ...(data.salary && { salary: data.salary }),
          ...(data.location && { location: data.location }),
        }),
      })
      updateApplication(app.id, {
        ai_score: data.score,
        ai_gaps: data.gaps,
        ai_summary: data.summary,
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setJd('')
    setResume('')
    setResult(null)
    onClose()
  }

  const scoreColor =
    !result ? '' :
    result.score >= 70 ? 'text-green-700 bg-green-50 border-green-300' :
    result.score >= 40 ? 'text-yellow-700 bg-yellow-50 border-yellow-300' :
    'text-red-700 bg-red-50 border-red-300'

  return (
    <Dialog open={!!app} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            AI Resume Match — {app?.company}
          </DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Job Description</Label>
              <Textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                rows={6}
                placeholder="Paste the full job description here..."
              />
            </div>
            <div className="space-y-1">
              <Label>Your Resume (plain text)</Label>
              <Textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                rows={6}
                placeholder="Paste your resume as plain text here..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleAnalyze} disabled={loading || !jd.trim() || !resume.trim()}>
                {loading ? 'Analyzing...' : 'Analyze Match'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {/* Score */}
            <div className={`border rounded-lg p-4 text-center ${scoreColor}`}>
              <p className="text-4xl font-bold">{result.score}%</p>
              <p className="text-sm font-medium mt-1">ATS Match Score</p>
            </div>

            {/* Summary */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Summary</p>
              <p className="text-sm text-gray-600">{result.summary}</p>
            </div>

            {/* Gaps */}
            {result.gaps?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Missing / Gaps</p>
                <div className="flex flex-wrap gap-2">
                  {result.gaps.map((gap, i) => (
                    <Badge key={i} variant="outline" className="border-red-300 text-red-700 text-xs">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted info */}
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 border-t pt-3">
              {result.salary && <p><span className="font-medium">Salary:</span> {result.salary}</p>}
              {result.location && <p><span className="font-medium">Location:</span> {result.location}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setResult(null)}>Analyze Again</Button>
              <Button onClick={handleClose}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
