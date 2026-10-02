import { describe, it, expect } from 'vitest'
import { amountOf, groupKeyOf, groupPositions, orderSlices, portfolioShare, toneOf } from '../portfolioView'

const slice = (assetType: string) => ({ assetType, label: assetType, pct: 10, count: 1 })

describe('portfolioView', () => {
  it('orders slices Bonos, CEDEARs, Acciones, Fondos, then anything unknown', () => {
    const ordered = orderSlices([slice('STOCK'), slice('MYSTERY'), slice('FCI'), slice('BOND'), slice('CEDEAR')] as any)
    expect(ordered.map((s) => s.assetType)).toEqual(['BOND', 'CEDEAR', 'STOCK', 'FCI', 'MYSTERY'])
  })

  it('files an unknown or missing asset type under OTHER', () => {
    expect(groupKeyOf('BOND')).toBe('BOND')
    expect(groupKeyOf('ETF')).toBe('OTHER')
    expect(groupKeyOf(undefined)).toBe('OTHER')
  })

  it('reads a money amount, and 0 for anything that is not a number', () => {
    expect(amountOf({ amount: '1500.50', currency: 'ARS' })).toBe(1500.5)
    expect(amountOf({ amount: 'n/a', currency: 'ARS' })).toBe(0)
    expect(amountOf(null)).toBe(0)
  })

  it('tones gains, losses and zero', () => {
    expect(toneOf(3)).toBe('gain')
    expect(toneOf(-0.5)).toBe('loss')
    expect(toneOf(0)).toBe('neutral')
    expect(toneOf(null)).toBe('neutral')
  })
})

const ars = (amount: string) => ({ amount, currency: 'ARS', secondary: null })
const row = (holdingId: number, ticker: string, assetType?: string) => ({ holdingId, ticker, assetType, marketValue: ars('100') })

describe('groupPositions', () => {
  it('groups in fixed order, drops empty groups and sorts by ticker then id', () => {
    const groups = groupPositions(
      [row(1, 'MELI', 'CEDEAR'), row(2, 'GD30', 'BOND'), row(3, 'AL30', 'BOND'), row(4, 'AL30', 'BOND'), row(5, 'GGAL', 'STOCK')],
      null,
    )
    expect(groups.map((g) => g.key)).toEqual(['BOND', 'CEDEAR', 'STOCK'])
    expect(groups[0].rows.map((r) => `${r.ticker}#${r.holdingId}`)).toEqual(['AL30#3', 'AL30#4', 'GD30#2'])
    expect(groups.every((g) => g.slice === null)).toBe(true)
  })

  it('attaches each group its own slice and files unknown types under OTHER', () => {
    const groups = groupPositions(
      [row(1, 'GGAL', 'STOCK'), row(2, 'XYZ', 'ETF')],
      [{ assetType: 'STOCK', count: 1, pct: 80 }, { assetType: 'BOND', count: 2, pct: 20 }],
    )
    expect(groups.map((g) => [g.key, g.slice?.pct ?? null])).toEqual([
      ['STOCK', 80],
      ['OTHER', null],
    ])
  })
})

describe('portfolioShare', () => {
  it('is the value over the total, in percent', () => {
    expect(portfolioShare(ars('1500000'), ars('10000000'))).toBe(15)
  })

  it('is unknown without a total', () => {
    expect(portfolioShare(ars('1'), ars('0'))).toBeNull()
    expect(portfolioShare(ars('1'), undefined)).toBeNull()
    expect(portfolioShare(undefined, ars('10'))).toBeNull()
  })
})
