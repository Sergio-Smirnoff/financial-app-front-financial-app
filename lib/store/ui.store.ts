import { create } from 'zustand'

type Modal =
  | 'create-transaction'
  | 'edit-transaction'
  | 'create-category'
  | 'create-subcategory'
  | 'create-loan'
  | 'create-card-expense'
  | 'confirm-delete'
  | null

interface ConfirmDeletePayload {
  title: string
  description: string
  onConfirm: () => void
}

interface UiState {
  // Active modal
  modal: Modal
  modalData: unknown
  openModal: (modal: Modal, data?: unknown) => void
  closeModal: () => void

  // Confirm delete dialog
  confirmDelete: ConfirmDeletePayload | null
  openConfirmDelete: (payload: ConfirmDeletePayload) => void
  closeConfirmDelete: () => void

  // Currency filter (global)
  currency: string
  setCurrency: (currency: string) => void

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

  confirmDelete: null,
  openConfirmDelete: (payload) => set({ confirmDelete: payload }),
  closeConfirmDelete: () => set({ confirmDelete: null }),

  currency: 'USD',
  setCurrency: (currency) => set({ currency }),

  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
