import { create } from 'zustand'

export interface DatabaseConnection {
  id: string
  name: string
  type: string
  host: string
  port: number
  database: string
}

interface AppState {
  databases: DatabaseConnection[]
  selectedDatabaseId: string | null
  currentQuery: string
  queryResult: any | null
  setDatabases: (dbs: DatabaseConnection[]) => void
  setSelectedDatabaseId: (id: string | null) => void
  setCurrentQuery: (query: string) => void
  setQueryResult: (result: any) => void
}

export const useAppStore = create<AppState>((set) => ({
  databases: [],
  selectedDatabaseId: null,
  currentQuery: '',
  queryResult: null,
  setDatabases: (dbs) => set({ databases: dbs }),
  setSelectedDatabaseId: (id) => set({ selectedDatabaseId: id }),
  setCurrentQuery: (query) => set({ currentQuery: query }),
  setQueryResult: (result) => set({ queryResult: result }),
}))
