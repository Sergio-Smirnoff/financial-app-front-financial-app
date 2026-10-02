import { describe, it, expect } from 'vitest'
import { formatPercent } from '../percent'

describe('formatPercent', () => {
  it('is always signed and uses a NBSP before %', () => {
    expect(formatPercent(4.8)).toBe('+4,80 %')
    expect(formatPercent(-1)).toBe('−1,00 %')
  })

  it('can drop the forced plus sign for shares', () => {
    expect(formatPercent(36.9, { decimals: 1, signed: false })).toBe('36,9 %')
    expect(formatPercent(-2, { decimals: 1, signed: false })).toBe('−2,0 %')
  })

  it('renders values that round to zero without a sign', () => {
    expect(formatPercent(-0.04, { decimals: 1 })).toBe('0,0 %')
    expect(formatPercent(-0.04, { decimals: 1, signed: false })).toBe('0,0 %')
    expect(formatPercent(0.004)).toBe('0,00 %')
    expect(formatPercent(-0)).toBe('0,00 %')
  })
})
