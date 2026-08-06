export function formatPercent(value: number, opts?: { decimals?: number }): string {
  const decimals = opts?.decimals ?? 2
  const formatted = new Intl.NumberFormat('es-AR', {
    signDisplay: 'always',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
  return `${formatted} %`
}
