import { withTrueMinus } from './sign'

export function formatSignedNumber(value: number, maximumFractionDigits = 2): string {
  const formatted = new Intl.NumberFormat('es-AR', { signDisplay: 'exceptZero', maximumFractionDigits }).format(value)
  return withTrueMinus(formatted)
}
