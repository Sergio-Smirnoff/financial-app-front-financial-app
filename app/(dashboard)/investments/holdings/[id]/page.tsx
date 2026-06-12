'use client'

import { useParams, useRouter } from 'next/navigation'
import { usePortfolioHoldings } from '@/lib/hooks/useInvestments'
import { TickerChartPanel } from '@/components/pages/investments/TickerChartPanel'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/currency'

export default function HoldingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: holdings = [], isLoading } = usePortfolioHoldings()
  const holding = holdings.find((candidate) => String(candidate.id) === id)

  if (isLoading) return <LoadingSpinner />
  if (!holding) return <p className="p-6 text-sm text-muted-foreground">Holding not found.</p>

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()}>&larr; Back</Button>
      <TickerChartPanel ticker={holding.ticker} />
      <div className="grid grid-cols-2 gap-4 text-sm">
        <Stat label="Quantity" value={String(holding.quantity)} />
        <Stat label="Avg price" value={formatCurrency(holding.avgPurchasePrice, holding.currency)} />
        <Stat label="Market value" value={holding.currentValue != null ? formatCurrency(holding.currentValue, holding.currency) : '—'} />
        <Stat label="P&L" value={holding.plAmount != null ? `${holding.plAmount >= 0 ? '+' : ''}${formatCurrency(holding.plAmount, holding.currency)}` : '—'} />
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  )
}
