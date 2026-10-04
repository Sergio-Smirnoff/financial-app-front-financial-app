import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { usePathname } from 'next/navigation'
import { HoldingDraftReset } from '../HoldingDraftReset'
import { useHoldingDraftStore } from '@/lib/store/holdingDraft.store'

vi.mock('next/navigation', () => ({ usePathname: vi.fn() }))

describe('HoldingDraftReset', () => {
  beforeEach(() => useHoldingDraftStore.getState().openCreate({ ticker: 'GGAL' }))

  it('keeps the draft on the position page and on investments', () => {
    vi.mocked(usePathname).mockReturnValue('/investments/holdings/7')
    const { rerender } = render(<HoldingDraftReset />)
    expect(useHoldingDraftStore.getState().draft).not.toBeNull()

    vi.mocked(usePathname).mockReturnValue('/investments')
    rerender(<HoldingDraftReset />)
    expect(useHoldingDraftStore.getState().draft).not.toBeNull()
  })

  it('drops the draft when the user leaves investments', () => {
    vi.mocked(usePathname).mockReturnValue('/investments/holdings/7')
    const { rerender } = render(<HoldingDraftReset />)

    vi.mocked(usePathname).mockReturnValue('/transactions')
    rerender(<HoldingDraftReset />)

    expect(useHoldingDraftStore.getState().draft).toBeNull()
  })
})
