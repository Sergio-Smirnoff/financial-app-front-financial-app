import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { safeJsonStorage } from './safeStorage'

export const CARTERA_COLUMNS = [
  'name',
  'assetType',
  'bank',
  'quantity',
  'avgCost',
  'price',
  'marketValue',
  'share',
  'pnl',
  'pnlPct',
] as const

export type CarteraColumn = (typeof CARTERA_COLUMNS)[number]
export type CarteraSortKey = 'ticker' | CarteraColumn
export type ColumnVisibility = Readonly<Record<CarteraColumn, boolean>>

export interface CarteraSort {
  key: CarteraSortKey
  direction: 'asc' | 'desc'
}

export const CARTERA_VIEW_STORAGE_KEY = 'investments.cartera.view.v1'
export const PHONE_QUERY = '(max-width: 767px)'

export const DEFAULT_COLUMNS: ColumnVisibility = {
  name: true,
  assetType: true,
  bank: false,
  quantity: true,
  avgCost: true,
  price: true,
  marketValue: true,
  share: true,
  pnl: true,
  pnlPct: true,
}

export const PHONE_COLUMNS: ColumnVisibility = {
  name: false,
  assetType: false,
  bank: false,
  quantity: false,
  avgCost: false,
  price: false,
  marketValue: false,
  share: false,
  pnl: false,
  pnlPct: false,
}

export const DEFAULT_SORT: CarteraSort = { key: 'ticker', direction: 'asc' }

const SORT_KEYS: readonly CarteraSortKey[] = ['ticker', ...CARTERA_COLUMNS]
const TEXT_SORT_KEYS: ReadonlySet<CarteraSortKey> = new Set(['ticker', 'name', 'assetType', 'bank'])

export function nextSort(current: CarteraSort, key: CarteraSortKey): CarteraSort {
  if (current.key === key) return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
  return { key, direction: TEXT_SORT_KEYS.has(key) ? 'asc' : 'desc' }
}

interface PersistedCarteraView {
  grouped: boolean
  columns: ColumnVisibility
  sort: CarteraSort
}

export interface CarteraViewState extends PersistedCarteraView {
  setGrouped: (grouped: boolean) => void
  toggleColumn: (column: CarteraColumn) => void
  sortBy: (key: CarteraSortKey) => void
  reset: () => void
}

const DEFAULT_VIEW: PersistedCarteraView = {
  grouped: true,
  columns: DEFAULT_COLUMNS,
  sort: DEFAULT_SORT,
}

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function readColumns(value: unknown, fallback: ColumnVisibility): ColumnVisibility {
  const stored = asRecord(value)
  const columns: Record<CarteraColumn, boolean> = { ...fallback }
  for (const column of CARTERA_COLUMNS) {
    const flag = stored[column]
    if (typeof flag === 'boolean') columns[column] = flag
  }
  return columns
}

function readSort(value: unknown, fallback: CarteraSort): CarteraSort {
  const stored = asRecord(value)
  const key = SORT_KEYS.find((candidate) => candidate === stored.key)
  const direction = stored.direction === 'asc' || stored.direction === 'desc' ? stored.direction : null
  return key && direction ? { key, direction } : fallback
}

export const useCarteraViewStore = create<CarteraViewState>()(
  persist(
    (set) => ({
      ...DEFAULT_VIEW,
      setGrouped: (grouped) => set({ grouped }),
      toggleColumn: (column) => set((state) => ({ columns: { ...state.columns, [column]: !state.columns[column] } })),
      sortBy: (key) => set((state) => ({ sort: nextSort(state.sort, key) })),
      reset: () => set(DEFAULT_VIEW),
    }),
    {
      name: CARTERA_VIEW_STORAGE_KEY,
      version: 1,
      storage: safeJsonStorage<PersistedCarteraView>(),
      skipHydration: true,
      partialize: ({ grouped, columns, sort }) => ({ grouped, columns, sort }),
      merge: (persisted, current) => {
        const stored = asRecord(persisted)
        return {
          ...current,
          grouped: typeof stored.grouped === 'boolean' ? stored.grouped : current.grouped,
          columns: readColumns(stored.columns, current.columns),
          sort: readSort(stored.sort, current.sort),
        }
      },
    },
  ),
)
