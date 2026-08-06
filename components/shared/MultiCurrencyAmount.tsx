import { Money } from '@/components/ui-kit/money/Money'

export interface CurrencyAmount {
  amount: number
  currency: string
}

export interface MultiCurrencyAmountProps {
  items: CurrencyAmount[]
  className?: string
}

export function MultiCurrencyAmount({ items, className }: MultiCurrencyAmountProps) {
  const nonZero = items.filter((i) => i.amount !== 0)
  const displayItems = nonZero.length > 0 ? nonZero : [items[0] ?? { amount: 0, currency: 'USD' }]

  return (
    <span className={className}>
      {displayItems.map((item, i) => (
        <span key={item.currency}>
          {i > 0 && <span className="mx-1 text-muted-foreground">·</span>}
          <Money value={{ amount: String(item.amount), currency: item.currency, secondary: null }} />
        </span>
      ))}
    </span>
  )
}
