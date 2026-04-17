'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import type { HoldingWithPrice } from '@/types/investments'

interface Props {
  holdings: HoldingWithPrice[]
}

export function TopMovers({ holdings }: Props) {
  const withPl = holdings.filter(
    (h) => h.plPercent !== null && h.currentPrice !== null,
  )

  const gainers = withPl
    .filter((h) => (h.plPercent ?? 0) > 0)
    .sort((a, b) => (b.plPercent ?? 0) - (a.plPercent ?? 0))
    .slice(0, 5)

  const losers = withPl
    .filter((h) => (h.plPercent ?? 0) < 0)
    .sort((a, b) => (a.plPercent ?? 0) - (b.plPercent ?? 0))
    .slice(0, 5)

  if (withPl.length === 0) return null

  return (
    <div className="rounded-xl border bg-card p-4">
      <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
        Top Movers
      </h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-1 mb-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-xs font-medium text-green-500">Gainers</span>
          </div>
          {gainers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No gainers</p>
          ) : (
            <div className="space-y-2">
              {gainers.map((h) => (
                <div key={h.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold">{h.ticker}</span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      {formatCurrency(h.currentValue ?? 0, h.currency)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-green-500">
                    +{h.plPercent?.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-1 mb-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-red-500">Losers</span>
          </div>
          {losers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No losers</p>
          ) : (
            <div className="space-y-2">
              {losers.map((h) => (
                <div key={h.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold">{h.ticker}</span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      {formatCurrency(h.currentValue ?? 0, h.currency)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-red-500">
                    {h.plPercent?.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
