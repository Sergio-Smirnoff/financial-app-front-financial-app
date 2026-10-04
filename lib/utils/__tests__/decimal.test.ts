import { describe, it, expect } from 'vitest'
import { compareDecimal, parseDecimal, toPlainDecimal } from '../decimal'

describe('parseDecimal', () => {
  it.each([
    ['1.5', '1.5'],
    ['1,5', '1.5'],
    ['1,50', '1.5'],
    ['000.100', '0.1'],
    ['007', '7'],
    ['0.10', '0.1'],
    ['10.', '10'],
    ['.5', '0.5'],
    ['  42  ', '42'],
    ['1.500000000', '1.5'],
    ['123456789012.123456', '123456789012.123456'],
  ])('normalises %j to %j', (raw, value) => {
    expect(parseDecimal(raw)).toEqual({ ok: true, value })
  })

  it.each(['', ' '])('rejects %j as empty', (raw) => {
    expect(parseDecimal(raw)).toEqual({ ok: false, reason: 'empty' })
  })

  it.each(['1e-7', '1.5e-7', '-1', '+1', '1.234.5', '1 000', '1,000.5', '.', ',', 'abc', 'Infinity'])(
    'rejects %j as format',
    (raw) => {
      expect(parseDecimal(raw)).toEqual({ ok: false, reason: 'format' })
    },
  )

  it('rejects more decimals than the scale', () => {
    expect(parseDecimal('0.0000001')).toEqual({ ok: false, reason: 'scale' })
    expect(parseDecimal('1.234', { scale: 2 })).toEqual({ ok: false, reason: 'scale' })
  })

  it('checks the scale after dropping trailing zeros', () => {
    expect(parseDecimal('1.2300000')).toEqual({ ok: true, value: '1.23' })
  })

  it('rejects more integer digits than allowed', () => {
    expect(parseDecimal('1234567890123')).toEqual({ ok: false, reason: 'integerDigits' })
    expect(parseDecimal('1000', { integerDigits: 3 })).toEqual({ ok: false, reason: 'integerDigits' })
  })

  it('checks integer digits after dropping leading zeros', () => {
    expect(parseDecimal('0000123456789012')).toEqual({ ok: true, value: '123456789012' })
  })

  it('rejects zero unless allowed', () => {
    expect(parseDecimal('0')).toEqual({ ok: false, reason: 'notPositive' })
    expect(parseDecimal('0,000')).toEqual({ ok: false, reason: 'notPositive' })
    expect(parseDecimal('0', { allowZero: true })).toEqual({ ok: true, value: '0' })
    expect(parseDecimal('0.00', { allowZero: true })).toEqual({ ok: true, value: '0' })
  })

  it('validates thresholds with their own limits', () => {
    const threshold = { scale: 2, integerDigits: 3, allowZero: true }
    expect(parseDecimal('12,50', threshold)).toEqual({ ok: true, value: '12.5' })
    expect(parseDecimal('1.234', threshold)).toEqual({ ok: false, reason: 'scale' })
    expect(parseDecimal('-1', threshold)).toEqual({ ok: false, reason: 'format' })
  })
})

describe('compareDecimal', () => {
  it.each([
    ['1', '1', 0],
    ['1.5', '1.50', 0],
    ['1.5', '1.49', 1],
    ['1.49', '1.5', -1],
    ['0.000001', '0', 1],
    ['10', '9.999999', 1],
    ['123456789012.123457', '123456789012.123456', 1],
    ['123456789012.123455', '123456789012.123456', -1],
    ['123456789012.123456', '123456789012.123456', 0],
  ] as const)('compares %s with %s as %i', (a, b, expected) => {
    expect(compareDecimal(a, b)).toBe(expected)
  })
})

describe('toPlainDecimal', () => {
  it.each([
    [1e-7, '0.0000001'],
    [1.5e-7, '0.00000015'],
    [1e21, '1000000000000000000000'],
    [812.5, '812.5'],
    [100, '100'],
    [0, '0'],
  ])('writes %d as %j', (n, plain) => {
    expect(toPlainDecimal(n)).toBe(plain)
  })

  it('rounds half up to an optional number of decimals', () => {
    expect(toPlainDecimal(812.123456789, 6)).toBe('812.123457')
    expect(toPlainDecimal(0.0000012, 6)).toBe('0.000001')
    expect(toPlainDecimal(9.9999999, 6)).toBe('10')
    expect(toPlainDecimal(0.0000001, 6)).toBe('0')
  })

  it('writes nothing for a non-finite number', () => {
    expect(toPlainDecimal(Number.NaN)).toBe('')
  })
})
