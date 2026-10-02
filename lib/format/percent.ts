export function formatPercent(value: number, opts?: { decimals?: number; signed?: boolean }): string {
  const decimals = opts?.decimals ?? 2
  const formatted = new Intl.NumberFormat('es-AR', {
    signDisplay: opts?.signed === false ? 'auto' : 'always',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
  return `${formatted}\u00a0%`
}
