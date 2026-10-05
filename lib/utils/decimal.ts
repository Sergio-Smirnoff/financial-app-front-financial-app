// Decimal input handled as exact strings end to end. The backend binds these
// strings to BigDecimal and enforces @Digits, which counts trailing zeros, so
// parseDecimal returns the normalised value that is both validated and sent.

export type DecimalRejection = 'empty' | 'format' | 'scale' | 'integerDigits' | 'notPositive'

export type DecimalResult = { ok: true; value: string } | { ok: false; reason: DecimalRejection }

export interface DecimalLimits {
  scale?: number
  integerDigits?: number
  allowZero?: boolean
}

export const AMOUNT_LIMITS = { scale: 6, integerDigits: 12 }
export const THRESHOLD_LIMITS = { scale: 2, integerDigits: 3, allowZero: true }

const DECIMAL_PATTERN = /^(\d*)(?:[.,](\d*))?$/
const PLAIN_DECIMAL = /^\d+(?:\.\d+)?$/

export const isPlainDecimal = (value: string): value is `${number}` => PLAIN_DECIMAL.test(value)

const join = (integer: string, fraction: string): string => (fraction ? `${integer}.${fraction}` : integer)

const normalise = (integer: string, fraction: string): { integer: string; fraction: string } => ({
  integer: integer.replace(/^0+/, '') || '0',
  fraction: fraction.replace(/0+$/, ''),
})

export function parseDecimal(raw: string, opts: DecimalLimits = {}): DecimalResult {
  const { scale = AMOUNT_LIMITS.scale, integerDigits = AMOUNT_LIMITS.integerDigits, allowZero = false } = opts
  const trimmed = raw.trim()
  if (trimmed === '') return { ok: false, reason: 'empty' }
  const match = DECIMAL_PATTERN.exec(trimmed)
  if (!match || !/\d/.test(trimmed)) return { ok: false, reason: 'format' }
  const { integer, fraction } = normalise(match[1], match[2] ?? '')
  if (fraction.length > scale) return { ok: false, reason: 'scale' }
  if (integer !== '0' && integer.length > integerDigits) return { ok: false, reason: 'integerDigits' }
  if (!allowZero && integer === '0' && fraction === '') return { ok: false, reason: 'notPositive' }
  return { ok: true, value: join(integer, fraction) }
}

const unscaled = (value: string, scale: number): bigint => {
  const [integer, fraction = ''] = value.split('.')
  return BigInt(integer + fraction.padEnd(scale, '0'))
}

export function compareDecimal(a: string, b: string): -1 | 0 | 1 {
  if (!isPlainDecimal(a) || !isPlainDecimal(b)) {
    throw new RangeError(`compareDecimal expects plain non-negative decimals, got "${a}" and "${b}"`)
  }
  const scale = Math.max(a.split('.')[1]?.length ?? 0, b.split('.')[1]?.length ?? 0)
  const left = unscaled(a, scale)
  const right = unscaled(b, scale)
  return left === right ? 0 : left > right ? 1 : -1
}

const expandExponent = (magnitude: string): string => {
  const [mantissa, exponent] = magnitude.split('e')
  if (exponent === undefined) return magnitude
  const [integer, fraction = ''] = mantissa.split('.')
  const digits = integer + fraction
  const point = integer.length + Number(exponent)
  if (point <= 0) return `0.${'0'.repeat(-point)}${digits}`
  if (point >= digits.length) return digits + '0'.repeat(point - digits.length)
  return `${digits.slice(0, point)}.${digits.slice(point)}`
}

const roundHalfUp = (integer: string, fraction: string, scale: number): { integer: string; fraction: string } => {
  if (fraction.length <= scale) return { integer, fraction }
  const roundsUp = fraction[scale] >= '5'
  const digits = (BigInt(integer + fraction.slice(0, scale)) + BigInt(roundsUp ? 1 : 0)).toString().padStart(scale + 1, '0')
  return { integer: digits.slice(0, digits.length - scale), fraction: digits.slice(digits.length - scale) }
}

// For prefilling inputs from display-origin numbers (e.g. a market quote) only;
// values that are sent must come from parseDecimal.
export function toPlainDecimal(n: number, maxFractionDigits?: number): string {
  if (!Number.isFinite(n)) return ''
  const [integer, fraction = ''] = expandExponent(String(Math.abs(n))).split('.')
  const rounded = maxFractionDigits === undefined ? { integer, fraction } : roundHalfUp(integer, fraction, maxFractionDigits)
  const plain = normalise(rounded.integer, rounded.fraction)
  const value = join(plain.integer, plain.fraction)
  return n < 0 && value !== '0' ? `-${value}` : value
}
