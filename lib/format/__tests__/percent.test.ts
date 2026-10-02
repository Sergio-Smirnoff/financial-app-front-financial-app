import { describe, it, expect } from 'vitest'
import { formatPercent } from '../percent'

describe('formatPercent', () => {
  it('is always signed and uses a NBSP before %', () => {
    expect(formatPercent(4.8)).toBe('+4,80\u00a0%')
    expect(formatPercent(-1)).toMatch(/^[-−]1,00\u00a0%$/)
  })

  it('can drop the forced plus sign for shares', () => {
    expect(formatPercent(36.9, { decimals: 1, signed: false })).toBe('36,9\u00a0%')
    expect(formatPercent(-2, { decimals: 1, signed: false })).toMatch(/^[-−]2,0\u00a0%$/)
  })
})
