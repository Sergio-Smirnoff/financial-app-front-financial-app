import { describe, it, expect } from 'vitest'
import { useSection } from '../useSection'

describe('useSection', () => {
  it('returns loading state when isLoading is true', () => {
    expect(useSection(undefined, true)).toEqual({ state: 'loading' })
  })

  it('returns unavailable when status is UNAVAILABLE', () => {
    const section = { status: 'UNAVAILABLE' as const, observedAt: '2026-08-06T10:00:00Z', data: null }
    expect(useSection(section, false)).toEqual({ state: 'unavailable', observedAt: '2026-08-06T10:00:00Z' })
  })

  it('returns empty when data is an empty array', () => {
    const section = { status: 'OK' as const, observedAt: '2026-08-06T10:00:00Z', data: [] }
    expect(useSection(section, false)).toEqual({ state: 'empty', observedAt: '2026-08-06T10:00:00Z' })
  })

  it('returns ready with data when present', () => {
    const section = { status: 'OK' as const, observedAt: '2026-08-06T10:00:00Z', data: [1, 2, 3] }
    expect(useSection(section, false)).toEqual({ state: 'ready', data: [1, 2, 3], observedAt: '2026-08-06T10:00:00Z' })
  })
})
