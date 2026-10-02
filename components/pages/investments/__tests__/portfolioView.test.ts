import { describe, it, expect } from 'vitest'
import { amountOf, groupKeyOf, orderSlices, toneOf } from '../portfolioView'

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
