export type Status =
  | 'applied'
  | 'screening'
  | 'technical'
  | 'final'
  | 'offer'
  | 'rejected'

export interface Application {
  id: string
  user_id: string
  company: string
  role: string
  status: Status
  job_url?: string
  salary?: string
  location?: string
  notes?: string
  applied_date: string
  ai_score?: number
  ai_gaps?: string[]
  ai_summary?: string
  created_at: string
  updated_at: string
}

export const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: 'applied',    label: 'Applied',      color: 'bg-blue-500'   },
  { id: 'screening',  label: 'Screening',    color: 'bg-yellow-500' },
  { id: 'technical',  label: 'Technical',    color: 'bg-orange-500' },
  { id: 'final',      label: 'Final Round',  color: 'bg-purple-500' },
  { id: 'offer',      label: 'Offer',        color: 'bg-green-500'  },
  { id: 'rejected',   label: 'Rejected',     color: 'bg-red-500'    },
]
