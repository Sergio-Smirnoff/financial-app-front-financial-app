import { Money } from '@/components/ui-kit/money/Money'
import { DeltaBadge } from '@/components/ui-kit/money/DeltaBadge'
import type { MoneyView } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface StockBarProps {
  ticker: string
  name: string
  quantity: number
  avgPrice: MoneyView
  currentValue: MoneyView
  pnlPct: number
  className?: string
}

export function StockBar({ ticker, name, quantity, avgPrice, currentValue, pnlPct, className }: StockBarProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4 py-3 border-b last:border-b-0', className)}>
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold">{ticker}</span>
          <span className="truncate text-sm text-muted-foreground hidden sm:inline">{name}</span>
        </div>
        <span className="n text-xs text-muted-foreground">
          {quantity} unidades · Costo: <Money value={avgPrice} className="text-xs" />
        </span>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <Money value={currentValue} className="text-sm font-semibold" />
        <DeltaBadge pct={pnlPct} />
      </div>
    </div>
  )
}
