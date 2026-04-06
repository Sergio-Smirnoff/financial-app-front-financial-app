import { formatCurrency } from '@/lib/utils/currency'

interface CurrencyAmount {
  amount: number
  currency: string
}

interface MultiCurrencyAmountProps {
  items: CurrencyAmount[]
  className?: string
}

export function MultiCurrencyAmount({ items, className }: MultiCurrencyAmountProps) {
  const nonZero = items.filter((i) => i.amount !== 0)

  if (nonZero.length === 0) {
    return <span className={className}>{formatCurrency(0, items[0]?.currency ?? 'USD')}</span>
  }

  return (
    <span className={className}>
      {nonZero.map((item, i) => (
        <span key={item.currency}>
          {i > 0 && <span className="mx-1 text-muted-foreground">·</span>}
          {formatCurrency(item.amount, item.currency)}
        </span>
      ))}
    </span>
  )
}
