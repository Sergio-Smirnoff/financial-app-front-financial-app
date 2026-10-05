import { beforeEach, describe, expect, it } from 'vitest'
import {
  CARTERA_VIEW_STORAGE_KEY,
  DEFAULT_COLUMNS,
  DEFAULT_SORT,
  PHONE_COLUMNS,
  nextSort,
  useCarteraViewStore,
} from '../carteraView.store'

describe('nextSort', () => {
  it('flips the direction of the active column', () => {
    expect(nextSort({ key: 'marketValue', direction: 'desc' }, 'marketValue')).toEqual({ key: 'marketValue', direction: 'asc' })
  })

  it('starts text columns ascending and numeric columns descending', () => {
    expect(nextSort(DEFAULT_SORT, 'name')).toEqual({ key: 'name', direction: 'asc' })
    expect(nextSort(DEFAULT_SORT, 'pnl')).toEqual({ key: 'pnl', direction: 'desc' })
  })
})

describe('useCarteraViewStore', () => {
  beforeEach(() => {
    useCarteraViewStore.getState().reset()
    localStorage.clear()
  })

  it('round-trips grouping, columns and sort through localStorage', async () => {
    const view = useCarteraViewStore.getState()
    view.setGrouped(false)
    view.toggleColumn('bank')
    view.sortBy('marketValue')

    const saved = localStorage.getItem(CARTERA_VIEW_STORAGE_KEY)
    expect(JSON.parse(saved ?? 'null').state).toEqual({
      grouped: false,
      columns: { ...DEFAULT_COLUMNS, bank: true },
      sort: { key: 'marketValue', direction: 'desc' },
    })

    useCarteraViewStore.getState().reset()
    localStorage.setItem(CARTERA_VIEW_STORAGE_KEY, saved ?? '')
    await useCarteraViewStore.persist.rehydrate()

    const restored = useCarteraViewStore.getState()
    expect(restored.grouped).toBe(false)
    expect(restored.columns.bank).toBe(true)
    expect(restored.sort).toEqual({ key: 'marketValue', direction: 'desc' })
  })

  it('falls back to the default view when the stored value is unreadable', async () => {
    localStorage.setItem(CARTERA_VIEW_STORAGE_KEY, '{not json')
    await useCarteraViewStore.persist.rehydrate()

    const view = useCarteraViewStore.getState()
    expect(view.grouped).toBe(true)
    expect(view.columns).toEqual(DEFAULT_COLUMNS)
    expect(view.sort).toEqual(DEFAULT_SORT)
  })

  it('keeps only stored fields of the right shape', async () => {
    localStorage.setItem(
      CARTERA_VIEW_STORAGE_KEY,
      JSON.stringify({
        state: { grouped: 'yes', columns: { bank: 'on', avgCost: false }, sort: { key: 'nope', direction: 'up' } },
        version: 1,
      }),
    )
    await useCarteraViewStore.persist.rehydrate()

    const view = useCarteraViewStore.getState()
    expect(view.grouped).toBe(true)
    expect(view.columns).toEqual({ ...DEFAULT_COLUMNS, avgCost: false })
    expect(view.sort).toEqual(DEFAULT_SORT)
  })

  it('flips one desktop column and never offers a phone set to store', () => {
    useCarteraViewStore.getState().toggleColumn('name')

    expect(useCarteraViewStore.getState().columns).toEqual({ ...DEFAULT_COLUMNS, name: false })
    expect(Object.values(PHONE_COLUMNS).every((shown) => !shown)).toBe(true)
  })
})
