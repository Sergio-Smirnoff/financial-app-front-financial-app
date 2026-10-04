import { describe, it, expect } from 'vitest'
import { formatQuantity } from '../quantity'

describe('formatQuantity', () => {
  it('uses the es-AR decimal comma without forcing trailing zeros', () => {
    expect(formatQuantity(0.5)).toBe('0,5')
    expect(formatQuantity(10.25)).toBe('10,25')
    expect(formatQuantity(3)).toBe('3')
  })

  it('groups thousands with a dot', () => {
    expect(formatQuantity(1500)).toBe('1.500')
    expect(formatQuantity(1234567.125)).toBe('1.234.567,125')
  })

  it('keeps the precision of fractional units', () => {
    expect(formatQuantity(0.00012345)).toBe('0,00012345')
  })

  it('formats an exact decimal string without going through a number', () => {
    expect(formatQuantity('123456789012.123456')).toBe('123.456.789.012,123456')
    expect(formatQuantity('0.5')).toBe('0,5')
  })

  it('renders a dash for a string that is not a plain decimal', () => {
    expect(formatQuantity('')).toBe('—')
    expect(formatQuantity('1e-7')).toBe('—')
  })

  it('renders a dash when there is no number', () => {
    expect(formatQuantity(Number.NaN)).toBe('—')
    expect(formatQuantity(null)).toBe('—')
    expect(formatQuantity(undefined)).toBe('—')
  })
})
