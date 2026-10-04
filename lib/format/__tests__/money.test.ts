import { describe, it, expect } from 'vitest'
import { amountOf, formatMoney } from '../money'

describe('formatMoney', () => {
  it('formats ARS in es-AR grouping', () => {
    const formatted = formatMoney({ amount: '1284000', currency: 'ARS', secondary: null })
    expect(formatted).toContain('1.284.000,00')
  })
  it('renders the secondary figure when present', () => {
    const formatted = formatMoney({
      amount: '1000',
      currency: 'USD',
      secondary: { amount: '1190000', currency: 'ARS', secondary: null },
    })
    expect(formatted).toContain('1.000,00')
    expect(formatted).toContain('1.190.000,00')
    expect(formatted).toContain('·')
  })
  it('never rounds a string into a float', () => {
    expect(formatMoney({ amount: '0.1', currency: 'ARS', secondary: null }, { decimals: 2 })).toContain('0,10')
  })
})

describe('amountOf', () => {
  it('reads a money amount, and 0 for anything that is not a number', () => {
    expect(amountOf({ amount: '1500.50', currency: 'ARS' })).toBe(1500.5)
    expect(amountOf({ amount: 'n/a', currency: 'ARS' })).toBe(0)
    expect(amountOf(null)).toBe(0)
  })
})
