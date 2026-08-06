'use client'

import { usePortfolioSummary, usePortfolioHoldings } from '@/lib/hooks/useInvestments'
import { AllocationChart } from './AllocationChart'
import { HoldingTypeBreakdown } from './HoldingTypeBreakdown'
import { InlineBanner } from '@/components/ui-kit/feedback/InlineBanner'
import { formatCurrency } from '@/lib/format'

interface InvestmentsDashboardProps {
  enabled?: boolean
  bankNumber?: string | null
}

export function InvestmentsDashboard({ enabled = true, bankNumber }: InvestmentsDashboardProps) {
  const { data: summary, isLoading, isError, error } = usePortfolioSummary({ enabled })
  const { data: holdings = [] } = usePortfolioHoldings({ enabled })

  const filteredHoldings = bankNumber
    ? holdings.filter((holding) => holding.bankNumber === bankNumber)
    : holdings

  const bankTotalsByCurrency = bankNumber
    ? Object.entries(
        filteredHoldings.reduce<Record<string, number>>((acc, holding) => {
          const currency = holding.currency.toUpperCase()
          acc[currency] = (acc[currency] ?? 0) + (holding.currentValue ?? 0)
          return acc
        }, {}),
      )
    : []

  if (isLoading) return <div className="p-8 text-center text-sm text-muted-foreground">Cargando...</div>
  if (isError || (!summary && !isLoading)) return <InlineBanner tone="error" description={error?.message || 'Failed to load portfolio summary'} />

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="space-y-4">
        {bankNumber && filteredHoldings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No holdings for this bank yet.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Buy a holding in this bank to see its invested total here.
            </p>
          </div>
        )}

        {bankNumber && bankTotalsByCurrency.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {bankTotalsByCurrency.map(([currency, total]) => (
              <div
                key={currency}
                className="rounded-2xl border border-border bg-gradient-to-b from-muted/40 to-card p-5 min-w-[160px]"
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Invested · {currency}
                </p>
                <p className="text-2xl font-black tracking-tight">{formatCurrency(total, currency)}</p>
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest mt-1">read-only</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary?.breakdownArs && summary.breakdownArs.length > 0 && (
            <AllocationChart breakdown={summary.breakdownArs} currency="ARS" />
          )}
          {summary?.breakdownUsd && summary.breakdownUsd.length > 0 && (
            <AllocationChart breakdown={summary.breakdownUsd} currency="USD" />
          )}
          <HoldingTypeBreakdown />
        </div>
      </div>
    </div>
  )
}
