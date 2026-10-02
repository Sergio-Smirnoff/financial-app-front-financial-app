import { withTrueMinus } from './sign'

const roundsToZero = (value: number, decimals: number) => Math.round(Math.abs(value) * 10 ** decimals) === 0

export function formatPercent(value: number, opts?: { decimals?: number; signed?: boolean }): string {
  const decimals = opts?.decimals ?? 2
  const formatted = new Intl.NumberFormat('es-AR', {
    signDisplay: opts?.signed === false ? 'auto' : 'exceptZero',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(roundsToZero(value, decimals) ? 0 : value)
  return `${withTrueMinus(formatted)} %`
}
