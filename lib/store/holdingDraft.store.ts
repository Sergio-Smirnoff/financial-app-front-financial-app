import { create } from 'zustand'
import type { AssetType } from '@/types/investments'

export interface HoldingPrefill {
  ticker?: string
  name?: string
  assetType?: AssetType
  price?: number
  currency?: 'ARS' | 'USD'
}

export type HoldingDraft =
  | { mode: 'create'; prefill: HoldingPrefill }
  | { mode: 'edit'; holdingId: number }

interface HoldingDraftState {
  draft: HoldingDraft | null
  openCreate: (prefill?: HoldingPrefill) => void
  openEdit: (holdingId: number) => void
  clear: () => void
}

export const useHoldingDraftStore = create<HoldingDraftState>((set) => ({
  draft: null,
  openCreate: (prefill = {}) => set({ draft: { mode: 'create', prefill } }),
  openEdit: (holdingId) => set({ draft: { mode: 'edit', holdingId } }),
  clear: () => set({ draft: null }),
}))

export function keepsHoldingDraft(pathname: string): boolean {
  return pathname === '/investments' || pathname.startsWith('/investments/')
}
