import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { safeJsonStorage } from './safeStorage'

type Modal =
  | 'create-transaction'
  | 'edit-transaction'
  | 'create-category'
  | 'create-subcategory'
  | 'create-loan'
  | 'create-card-expense'
  | null

export const UI_SIDEBAR_STORAGE_KEY = 'ui.sidebar.collapsed.v1'

interface PersistedUi {
  sidebarCollapsed: boolean
}

interface UiState extends PersistedUi {
  modal: Modal
  modalData: unknown
  openModal: (modal: Modal, data?: unknown) => void
  closeModal: () => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebarCollapsed: () => void
}

function storedCollapsed(persisted: unknown): boolean | null {
  if (persisted === null || typeof persisted !== 'object') return null
  const flag = (persisted as Record<string, unknown>).sidebarCollapsed
  return typeof flag === 'boolean' ? flag : null
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      modal: null,
      modalData: null,
      openModal: (modal, data = null) => set({ modal, modalData: data }),
      closeModal: () => set({ modal: null, modalData: null }),

      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      sidebarCollapsed: false,
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: UI_SIDEBAR_STORAGE_KEY,
      version: 1,
      storage: safeJsonStorage<PersistedUi>(),
      skipHydration: true,
      partialize: ({ sidebarCollapsed }) => ({ sidebarCollapsed }),
      merge: (persisted, current) => ({ ...current, sidebarCollapsed: storedCollapsed(persisted) ?? false }),
    },
  ),
)
