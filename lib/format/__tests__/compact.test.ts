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

  it('rounds the half-tenth boundary up, free of float error', () => {
    expect(formatCompactNumber(999.95)).toBe('1k')
    expect(formatCompactNumber(999_950)).toBe('1M')
    expect(formatCompactNumber(999_949)).toBe('999,9k')
    expect(formatCompactNumber(1_250)).toBe('1,3k')
  })

  it('keeps one decimal below 1000 when asked, for small axis ticks', () => {
    expect(formatCompactNumber(0.25, 1)).toBe('0,3')
    expect(formatCompactNumber(12.34, 1)).toBe('12,3')
    expect(formatCompactNumber(-0.5, 1)).toBe('−0,5')
    expect(formatCompactNumber(1_500, 1)).toBe('1,5k')
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

  it('keeps one decimal below 1000 when asked, for narrow price axes', () => {
    expect(formatCompactMoney(10.4, 'ARS', 1)).toBe('$10,4')
    expect(formatCompactMoney(0.5, 'USD', 1)).toBe('US$0,5')
    expect(formatCompactMoney(-0.5, 'ARS', 1)).toBe('−$0,5')
    expect(formatCompactMoney(9.74e7, 'ARS', 1)).toBe('$97,4M')
    expect(formatCompactMoney(10.4)).toBe('$10')
  })

  it('separates an alphabetic currency code from the figure with a non-breaking space', () => {
    expect(formatCompactMoney(9.74e7, 'EUR')).toBe('EUR\u00a097,4M')
    expect(formatCompactMoney(-8e7, 'eur')).toBe('−EUR\u00a080M')
  })
})

describe('currencySymbol', () => {
  it.each(['USD', 'USD_MEP', 'USD_CCL', 'usd'])('marks the dollar code %s as US$', (code) => {
    expect(currencySymbol(code)).toBe('US$')
  })

  it('marks pesos as $', () => {
    expect(currencySymbol('ARS')).toBe('$')
    expect(currencySymbol('')).toBe('$')
  })

  it('shows an unknown code as itself instead of passing it off as pesos', () => {
    expect(currencySymbol('EUR')).toBe('EUR')
  })

  it('prefixes US$ for every dollar view', () => {
    expect(formatCompactMoney(1.5e3, 'USD_MEP')).toBe('US$1,5k')
    expect(formatCompactMoney(1.5e3, 'USD_CCL')).toBe('US$1,5k')
  })
})
