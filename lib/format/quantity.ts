const quantityFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 8 })

export function formatQuantity(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return quantityFormat.format(value)
}
