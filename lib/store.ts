import { create } from 'zustand'
import { Application } from './types'

interface BoardStore {
  applications: Application[]
  setApplications: (apps: Application[]) => void
  addApplication: (app: Application) => void
  updateApplication: (id: string, updates: Partial<Application>) => void
  removeApplication: (id: string) => void
}

export const useBoardStore = create<BoardStore>((set) => ({
  applications: [],

  setApplications: (apps) => set({ applications: apps }),

  addApplication: (app) =>
    set((state) => ({ applications: [...state.applications, app] })),

  updateApplication: (id, updates) =>
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, ...updates } : app
      ),
    })),

  removeApplication: (id) =>
    set((state) => ({
      applications: state.applications.filter((app) => app.id !== id),
    })),
}))
