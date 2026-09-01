import { create } from 'zustand'

type Modal =
  | 'create-transaction'
  | 'edit-transaction'
  | 'create-category'
  | 'create-subcategory'
  | 'create-loan'
  | 'create-card-expense'
  | null

interface UiState {
  // Active modal
  modal: Modal
  modalData: unknown
  openModal: (modal: Modal, data?: unknown) => void
  closeModal: () => void

  // Sidebar collapsed (mobile)
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>((set) => ({
  modal: null,
  modalData: null,
  openModal: (modal, data = null) => set({ modal, modalData: data }),
  closeModal: () => set({ modal: null, modalData: null }),

  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
