import { describe, it, expect } from 'vitest'
import { formatSignedNumber } from '../number'

describe('formatSignedNumber', () => {
  it('signs a delta with a true minus and es-AR separators', () => {
    expect(formatSignedNumber(-12)).toBe('−12')
    expect(formatSignedNumber(1234.5)).toBe('+1.234,5')
  })

  it('prints zero without a sign', () => {
    expect(formatSignedNumber(0)).toBe('0')
  })
})
