import { describe, it, expect } from 'vitest'
import { MINUS, withTrueMinus } from '../sign'

describe('withTrueMinus', () => {
  it('replaces a leading ASCII hyphen with U+2212', () => {
    expect(MINUS).toBe('−')
    expect(withTrueMinus('-$ 1.234,00')).toBe('−$ 1.234,00')
  })

  it('leaves unsigned and positive values untouched', () => {
    expect(withTrueMinus('1,00')).toBe('1,00')
    expect(withTrueMinus('+1,00')).toBe('+1,00')
  })
  it('only rewrites a leading hyphen', () => {
    expect(withTrueMinus('A-B')).toBe('A-B')
  })
})
