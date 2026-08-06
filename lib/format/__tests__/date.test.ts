import { describe, it, expect } from 'vitest'
import { formatDate, formatRelative } from '../date'

describe('formatDate', () => {
  it('formats short date', () => {
    expect(formatDate('2026-08-06T12:00:00Z')).toBe('06/08/2026')
  })
  it('formats long date', () => {
    expect(formatDate('2026-08-06T12:00:00Z', 'long')).toBe('6 de agosto de 2026')
  })
})

describe('formatRelative', () => {
  it('reads es-AR relative time', () => {
    expect(formatRelative('2026-08-06T12:00:00Z', new Date('2026-08-06T12:00:42Z'))).toBe('hace 42 s')
  })
})
