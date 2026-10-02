import { describe, expect, it } from 'vitest'
import type { PositionRow } from '@/lib/api/bff/types'
import { DEFAULT_COLUMNS } from '@/lib/store/carteraView.store'
import { matchesQuery, sortRows, visibleColumns } from '../carteraView'

const money = (amount: string) => ({ amount, currency: 'ARS', secondary: null })
const row = (holdingId: number, ticker: string, value: string, name = `${ticker} S.A.`): PositionRow => ({
  holdingId,
  ticker,
  name,
  assetType: 'STOCK',
  quantity: 1,
  avgCost: money('1'),
  price: money(value),
  marketValue: money(value),
  pnl: money('0'),
  pnlPct: 0,
  bankNumber: '017',
})

describe('visibleColumns', () => {
  it('keeps the catalogue order and drops the type column while grouped', () => {
    expect(visibleColumns({ ...DEFAULT_COLUMNS, bank: true }, true)).toEqual([
      'name', 'bank', 'quantity', 'avgCost', 'price', 'marketValue', 'share', 'pnl', 'pnlPct',
    ])
    expect(visibleColumns(DEFAULT_COLUMNS, false)).toContain('assetType')
  })
})

describe('matchesQuery', () => {
  it('matches the ticker or the name, ignoring case and surrounding spaces', () => {
    const ggal = row(1, 'GGAL', '1', 'Grupo Financiero Galicia')
    expect(matchesQuery(ggal, ' gal ')).toBe(true)
    expect(matchesQuery(ggal, 'financiero')).toBe(true)
    expect(matchesQuery(ggal, 'ypf')).toBe(false)
    expect(matchesQuery(ggal, '')).toBe(true)
  })
})

describe('sortRows', () => {
  it('sorts by value and breaks ties by ticker, then holding id', () => {
    const rows = [row(3, 'YPFD', '100'), row(2, 'AL30', '100'), row(1, 'AL30', '100'), row(4, 'MELI', '900')]

    const sorted = sortRows(rows, { key: 'marketValue', direction: 'desc' })

    expect(sorted.map((r) => `${r.ticker}#${r.holdingId}`)).toEqual(['MELI#4', 'AL30#1', 'AL30#2', 'YPFD#3'])
    expect(rows[0].ticker).toBe('YPFD')
  })

  it('sorts text columns alphabetically', () => {
    const sorted = sortRows([row(1, 'YPFD', '1'), row(2, 'AL30', '1')], { key: 'ticker', direction: 'asc' })
    expect(sorted.map((r) => r.ticker)).toEqual(['AL30', 'YPFD'])
  })

  it('sorts the bank and type columns by the text the table shows', () => {
    const galicia = { ...row(1, 'GGAL', '1'), bankNumber: '007' }
    const brubank = { ...row(2, 'YPFD', '1'), bankNumber: '143' }
    const names: Record<string, string> = { '007': 'Galicia', '143': 'Brubank' }

    const sorted = sortRows([galicia, brubank], { key: 'bank', direction: 'asc' }, (r) => names[r.bankNumber ?? ''])

    expect(sorted.map((r) => r.ticker)).toEqual(['YPFD', 'GGAL'])
  })
})
