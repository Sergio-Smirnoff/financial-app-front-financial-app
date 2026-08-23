import type { MoneyView } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface MoneyProps {
  value: MoneyView | null | undefined
  tone?: 'neutral' | 'gain' | 'loss'
  decimals?: number
  className?: string
  signed?: boolean
}

export function Money({ value, tone = 'neutral', decimals, className, signed }: MoneyProps) {
  // A BFF section can arrive with an absent figure; render a placeholder, never throw.
  if (!value || value.amount == null) {
    return <span className={cn('n text-muted-foreground', className)}>—</span>
  }

  const primary = formatSingleMoneyHelper(
    value.amount,
    value.currency,
    decimals,
    signed || tone === 'gain'
  )
  const secondary = value.secondary
    ? formatSingleMoneyHelper(value.secondary.amount, value.secondary.currency, decimals, false)
    : null

  return (
    <span
      className={cn(
        'n',
        tone === 'gain' && 'text-gain',
        tone === 'loss' && 'text-loss',
        className
      )}
    >
      {primary}
      {secondary && <span className="text-muted-foreground"> · {secondary}</span>}
    </span>
  )
}

function formatSingleMoneyHelper(
  amountStr: string,
  currency: string,
  decimals?: number,
  handlePositiveSign = false
): string {
  const dec = decimals ?? 2
  const num = Number(amountStr)
  if (isNaN(num)) return amountStr

  let formatted = new Intl.NumberFormat('es-AR', {
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
