import { MINUS } from './sign'

const SCALES = [
  { floor: 1e9, divisor: 1e9, suffix: 'B' },
  { floor: 1e6, divisor: 1e6, suffix: 'M' },
  { floor: 1e3, divisor: 1e3, suffix: 'k' },
] as const

const NO_BREAK_SPACE = '\u00a0'
const ALPHABETIC_CODE = /[A-Z]$/
const DOLLAR_CODES: ReadonlySet<string> = new Set(['USD', 'USD_MEP', 'USD_CCL'])
const PESO_CODES: ReadonlySet<string> = new Set(['ARS'])
const oneDecimal = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 })

const scaleFor = (magnitude: number) => SCALES.find((scale) => magnitude >= scale.floor)
const tenthsOf = (magnitude: number, divisor: number) => Math.round((magnitude * 10) / divisor) / 10
const roundBelowThousand = (magnitude: number, digits: 0 | 1) => (digits === 0 ? Math.round(magnitude) : tenthsOf(magnitude, 1))

export function currencySymbol(currency: string): string {
  const code = currency.trim().toUpperCase()
  if (DOLLAR_CODES.has(code)) return 'US$'
  if (PESO_CODES.has(code) || code === '') return '$'
  return code
}

export function isoCurrency(currency: string): string {
  const code = currency.trim().toUpperCase()
  return DOLLAR_CODES.has(code) ? 'USD' : code || 'ARS'
}

export function formatCompactNumber(value: number, fractionDigitsBelowThousand: 0 | 1 = 0): string {
  if (!Number.isFinite(value)) return '—'
  const magnitude = Math.abs(value)
  const candidate = scaleFor(magnitude)
  const rounded = candidate
    ? tenthsOf(magnitude, candidate.divisor) * candidate.divisor
    : roundBelowThousand(magnitude, fractionDigitsBelowThousand)
  const sign = value < 0 && rounded > 0 ? MINUS : ''
  const scale = scaleFor(rounded)
  if (!scale) return `${sign}${oneDecimal.format(rounded)}`
  return `${sign}${oneDecimal.format(tenthsOf(rounded, scale.divisor))}${scale.suffix}`
}

export function formatCompactMoney(
  value: number,
  currency: string = 'ARS',
  fractionDigitsBelowThousand: 0 | 1 = 0,
): string {
  if (!Number.isFinite(value)) return '—'
  const digits = formatCompactNumber(Math.abs(value), fractionDigitsBelowThousand)
  const sign = value < 0 && digits !== '0' ? MINUS : ''
  const symbol = currencySymbol(currency)
  const separator = ALPHABETIC_CODE.test(symbol) ? NO_BREAK_SPACE : ''
  return `${sign}${symbol}${separator}${digits}`
}
