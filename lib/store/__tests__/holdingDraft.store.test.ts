import { describe, it, expect, beforeEach } from 'vitest'
import { keepsHoldingDraft, useHoldingDraftStore } from '../holdingDraft.store'

describe('useHoldingDraftStore', () => {
  beforeEach(() => useHoldingDraftStore.setState({ draft: null }))

  it('opens a create draft with its prefill', () => {
    useHoldingDraftStore.getState().openCreate({ ticker: 'GGAL', price: 4850, currency: 'ARS' })
    expect(useHoldingDraftStore.getState().draft).toEqual({
      mode: 'create',
      prefill: { ticker: 'GGAL', price: 4850, currency: 'ARS' },
    })
  })

  it('opens an empty create draft', () => {
    useHoldingDraftStore.getState().openCreate()
    expect(useHoldingDraftStore.getState().draft).toEqual({ mode: 'create', prefill: {} })
  })

  it('opens an edit draft and clears it', () => {
    useHoldingDraftStore.getState().openEdit(7)
    expect(useHoldingDraftStore.getState().draft).toEqual({ mode: 'edit', holdingId: 7 })
    useHoldingDraftStore.getState().clear()
    expect(useHoldingDraftStore.getState().draft).toBeNull()
  })

  it('gives every open a new draft, so reopening the same prefill reloads the form', () => {
    const { openCreate } = useHoldingDraftStore.getState()
    openCreate({ ticker: 'GGAL' })
    const first = useHoldingDraftStore.getState().draft
    openCreate({ ticker: 'GGAL' })
    expect(useHoldingDraftStore.getState().draft).not.toBe(first)
  })

  it.each([
    ['/investments', true],
    ['/investments/holdings/7', true],
    ['/', false],
    ['/transactions', false],
    ['/investmentsx', false],
  ])('keeps the draft on %s: %s', (pathname, kept) => {
    expect(keepsHoldingDraft(pathname)).toBe(kept)
  })
})
