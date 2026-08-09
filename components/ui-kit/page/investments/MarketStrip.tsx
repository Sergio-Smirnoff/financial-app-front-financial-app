import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import { QuotePill, type Quote } from './QuotePill'
import { cn } from '@/lib/utils'

export interface MarketStripProps {
  quotes: Quote[]
  observedAt: string
  className?: string
}

export function MarketStrip({ quotes, observedAt, className }: MarketStripProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Mercado
        </span>
        <FreshnessStamp observedAt={observedAt} />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {quotes.map((q) => (
          <QuotePill key={q.code} quote={q} className="shrink-0" />
        ))}
      </div>
    </div>
  )
}
