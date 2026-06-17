'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { COLUMNS, Status } from '@/lib/types'
import { useBoardStore } from '@/lib/store'

interface Props {
  open: boolean
  onClose: () => void
}

export function AddApplicationModal({ open, onClose }: Props) {
  const addApplication = useBoardStore((s) => s.addApplication)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    company: '', role: '', status: 'applied' as Status,
    job_url: '', salary: '', location: '', notes: '',
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      addApplication(data)
      setForm({ company: '', role: '', status: 'applied', job_url: '', salary: '', location: '', notes: '' })
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="company">Company *</Label>
              <Input id="company" value={form.company} onChange={(e) => set('company', e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="role">Job Title *</Label>
              <Input id="role" value={form.role} onChange={(e) => set('role', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => v && set('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLUMNS.map((col) => (
                    <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="Remote / Noida" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="salary">Salary</Label>
              <Input id="salary" value={form.salary} onChange={(e) => set('salary', e.target.value)} placeholder="₹18–22 LPA" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="job_url">Job URL</Label>
              <Input id="job_url" value={form.job_url} onChange={(e) => set('job_url', e.target.value)} placeholder="https://..." />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2} placeholder="Recruiter name, referral, anything relevant..." />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
