import { formatCompactMoney, type MoneyView } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface MoneyProps {
  value: MoneyView | null | undefined
  tone?: 'neutral' | 'gain' | 'loss'
  decimals?: number
  className?: string
  signed?: boolean
  compact?: boolean
}

interface MoneyParts {
  primary: string
  secondary: string | null
}

function partsOf({ value, tone = 'neutral', decimals, signed, compact = false }: MoneyProps): MoneyParts | null {
  if (!value || value.amount == null) return null
  const primary = formatSingleMoneyHelper(value.amount, value.currency, decimals, signed || tone === 'gain', compact)
  const secondary = value.secondary
    ? formatSingleMoneyHelper(value.secondary.amount, value.secondary.currency, decimals, false, compact)
    : null
  return { primary, secondary }
}

export function moneyText(props: MoneyProps): string {
  const parts = partsOf(props)
  if (!parts) return '—'
  return parts.secondary ? `${parts.primary} · ${parts.secondary}` : parts.primary
}

export function Money(props: MoneyProps) {
  const { tone = 'neutral', className } = props
  const parts = partsOf(props)
  if (!parts) {
    return <span className={cn('n text-muted-foreground', className)}>—</span>
  }

  return (
    <span className={cn('n', tone === 'gain' && 'text-gain', tone === 'loss' && 'text-loss', className)}>
      {parts.primary}
      {parts.secondary && <span className="text-muted-foreground"> · {parts.secondary}</span>}
    </span>
  )
}

function formatSingleMoneyHelper(
  amountStr: string,
  currency: string,
  decimals?: number,
  handlePositiveSign = false,
  compact = false,
): string {
  const dec = decimals ?? 2
  const num = Number(amountStr)
  if (isNaN(num)) return amountStr

  let formatted = compact
    ? formatCompactMoney(num, currency)
    : new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency,
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      }).format(num)

  if (formatted.startsWith('-')) {
    formatted = '−' + formatted.slice(1).trimStart()
  } else if (handlePositiveSign && num > 0) {
    formatted = '+' + formatted
  }
  return formatted
}
