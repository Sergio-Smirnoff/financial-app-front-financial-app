import { describe, it, expect } from 'vitest'
import { formatMoney } from '../money'

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
