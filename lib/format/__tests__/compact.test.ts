import { describe, it, expect } from 'vitest'
import { formatCompactNumber, formatCompactMoney, currencySymbol } from '../compact'

describe('formatCompactNumber', () => {
  it.each([
    [1.5e3, '1,5k'],
    [8e7, '80M'],
    [9.74e7, '97,4M'],
    [2.5e9, '2,5B'],
    [1234, '1,2k'],
    [999, '999'],
    [12.3, '12'],
    [0, '0'],
  ])('formats %d as %s', (value, expected) => {
    expect(formatCompactNumber(value)).toBe(expected)
  })

  it('rolls a rounded value over into the next suffix', () => {
    expect(formatCompactNumber(999.6)).toBe('1k')
    expect(formatCompactNumber(999_960)).toBe('1M')
  })

  it('prefixes negatives with a true minus sign', () => {
    expect(formatCompactNumber(-1.5e3)).toBe('−1,5k')
    expect(formatCompactNumber(-8e7)).toBe('−80M')
  })

  it('never prints a negative zero', () => {
    expect(formatCompactNumber(-0.4)).toBe('0')
  })

  it('prints a dash for values that are not numbers', () => {
    expect(formatCompactNumber(Number.NaN)).toBe('—')
    expect(formatCompactNumber(Number.POSITIVE_INFINITY)).toBe('—')
  })
})

describe('formatCompactMoney', () => {
  it('prefixes the peso symbol by default', () => {
    expect(formatCompactMoney(9.74e7)).toBe('$97,4M')
  })

  it('prefixes US$ for dollars', () => {
    expect(formatCompactMoney(9.74e7, 'USD')).toBe('US$97,4M')
  })

  it('puts the sign before the symbol', () => {
    expect(formatCompactMoney(-8e7)).toBe('−$80M')
  })
})

describe('currencySymbol', () => {
  it('maps USD to US$ and everything else to $', () => {
    expect(currencySymbol('USD')).toBe('US$')
    expect(currencySymbol('ARS')).toBe('$')
  })
})
