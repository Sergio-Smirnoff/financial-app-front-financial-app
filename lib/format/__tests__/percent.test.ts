import { describe, it, expect } from 'vitest'
import { formatPercent } from '../percent'

describe('formatPercent', () => {
  it('is always signed and uses a NBSP before %', () => {
    expect(formatPercent(4.8)).toMatch(/\+4,80\s?%/)
    expect(formatPercent(-1)).toMatch(/[-−]1,00\s?%/)
  })
})
