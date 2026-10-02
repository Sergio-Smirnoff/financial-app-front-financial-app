const SCALES = [
  { floor: 1e9, divisor: 1e9, suffix: 'B' },
  { floor: 1e6, divisor: 1e6, suffix: 'M' },
  { floor: 1e3, divisor: 1e3, suffix: 'k' },
] as const

const MINUS = '−'
const oneDecimal = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 })
const wholeNumber = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

const scaleFor = (magnitude: number) => SCALES.find((scale) => magnitude >= scale.floor)
const roundToTenth = (n: number) => Math.round(n * 10) / 10

export function currencySymbol(currency: string): string {
  return currency === 'USD' ? 'US$' : '$'
}

export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const magnitude = Math.abs(value)
  const candidate = scaleFor(magnitude)
  const rounded = candidate
    ? roundToTenth(magnitude / candidate.divisor) * candidate.divisor
    : Math.round(magnitude)
  const sign = value < 0 && rounded > 0 ? MINUS : ''
  const scale = scaleFor(rounded)
  if (!scale) return `${sign}${wholeNumber.format(rounded)}`
  return `${sign}${oneDecimal.format(roundToTenth(rounded / scale.divisor))}${scale.suffix}`
}

export function formatCompactMoney(value: number, currency: string = 'ARS'): string {
  if (!Number.isFinite(value)) return '—'
  const digits = formatCompactNumber(Math.abs(value))
  const sign = value < 0 && digits !== '0' ? MINUS : ''
  return `${sign}${currencySymbol(currency)}${digits}`
}
