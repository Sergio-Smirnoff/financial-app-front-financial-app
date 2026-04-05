'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'
import type { PortfolioSummary } from '@/types/investments'

interface PortfolioSummaryCardProps {
  summary: PortfolioSummary
}

function PlValue({ amount, percent, currency }: { amount: number; percent: number; currency: string }) {
  const isPositive = amount >= 0
  return (
    <div>
      <span className={cn('text-sm font-medium', isPositive ? 'text-green-600' : 'text-red-600')}>
        {isPositive ? '+' : ''}{formatCurrency(amount, currency)}
      </span>
      <span className={cn('text-xs ml-1', isPositive ? 'text-green-600' : 'text-red-600')}>
        ({isPositive ? '+' : ''}{percent.toFixed(2)}%)
      </span>
    </div>
  )
}

export function PortfolioSummaryCard({ summary }: PortfolioSummaryCardProps) {
  const hasArs = summary.totalValueArs > 0 || summary.totalPlArs !== 0
  const hasUsd = summary.totalValueUsd > 0 || summary.totalPlUsd !== 0

  if (!hasArs && !hasUsd) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground text-center">
            No holdings yet. Add your first holding in the Holdings tab.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Portfolio Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {hasArs && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">ARS</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalValueArs, 'ARS')}</p>
              <PlValue amount={summary.totalPlArs} percent={summary.plPercentArs} currency="ARS" />
            </div>
          )}
          {hasUsd && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">USD</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.totalValueUsd, 'USD')}</p>
              <PlValue amount={summary.totalPlUsd} percent={summary.plPercentUsd} currency="USD" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
