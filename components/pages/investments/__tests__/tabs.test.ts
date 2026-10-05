import { describe, it, expect } from 'vitest'
import { resolveInvestmentsTab } from '../tabs'

describe('resolveInvestmentsTab', () => {
  it.each([
    [null, 'resumen'],
    ['', 'resumen'],
    ['resumen', 'resumen'],
    ['cartera', 'cartera'],
    ['mercados', 'mercados'],
    ['operaciones', 'operaciones'],
    ['portfolio', 'cartera'],
    ['markets', 'mercados'],
    ['operations', 'operaciones'],
    ['bogus', 'resumen'],
    ['constructor', 'resumen'],
  ] as const)('maps %s to %s', (raw, expected) => {
    expect(resolveInvestmentsTab(raw)).toBe(expected)
  })
})
