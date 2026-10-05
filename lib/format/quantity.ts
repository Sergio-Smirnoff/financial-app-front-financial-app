import { isPlainDecimal } from '@/lib/utils/decimal'

const quantityFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 8 })

export function formatQuantity(value: number | string | null | undefined): string {
  if (typeof value === 'string') return isPlainDecimal(value) ? quantityFormat.format(value) : '—'
  if (value == null || !Number.isFinite(value)) return '—'
  return quantityFormat.format(value)
}
