'use client'

import { useParams, useRouter } from 'next/navigation'
import { usePortfolioHoldings } from '@/lib/hooks/useInvestments'
import { TickerChartPanel } from '@/components/pages/investments/TickerChartPanel'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'

export default function HoldingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: holdings = [], isLoading } = usePortfolioHoldings()
  const holding = holdings.find((candidate) => String(candidate.id) === id)

  if (isLoading) return <div className="p-8 text-center text-sm text-muted-foreground">Cargando...</div>
  if (!holding) return <p className="p-6 text-sm text-muted-foreground">Holding not found.</p>

  const plIsPositive = holding.plAmount != null && holding.plAmount >= 0

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <Button type="button" variant="ghost" onClick={() => router.back()}>
        &larr; Back
      </Button>
      <TickerChartPanel ticker={holding.ticker} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Quantity" value={String(holding.quantity)} />
        <Stat label="Avg Price" value={formatCurrency(holding.avgPurchasePrice, holding.currency)} />
        <Stat
          label="Market Value"
          value={
            holding.currentValue != null
              ? formatCurrency(holding.currentValue, holding.currency)
              : '—'
          }
        />
        <Stat
          label="P&L"
          value={
            holding.plAmount != null
              ? `${plIsPositive ? '+' : ''}${formatCurrency(holding.plAmount, holding.currency)}`
              : '—'
          }
          valueClassName={
            holding.plAmount != null
              ? plIsPositive
                ? 'text-green-500'
                : 'text-destructive'
              : undefined
          }
        />
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-b from-muted/40 to-card p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </p>
      <p className={cn('text-lg font-black tracking-tight', valueClassName)}>{value}</p>
    </div>
  )
}
