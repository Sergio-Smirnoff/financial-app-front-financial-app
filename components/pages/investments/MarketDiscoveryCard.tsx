'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useMarketDiscovery } from '@/lib/hooks/useInvestments'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

export interface MarketDiscoveryCardProps {
  onSelectTicker?: (ticker: string) => void
}

export function MarketDiscoveryCard({ onSelectTicker }: MarketDiscoveryCardProps) {
  const t = useTranslations('investments')
  const { data, isLoading } = useMarketDiscovery(6)

  if (isLoading) {
    return <div className="h-28 rounded-xl bg-muted animate-pulse" />
  }

  const opportunities = data?.opportunities ?? []
  if (opportunities.length === 0) {
    return null
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3 shadow-sm">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-sm text-foreground">{t('market.discoveryTitle')}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {opportunities.map((item) => {
          const isPos = item.variation >= 0
          return (
            <button
              type="button"
              key={item.ticker}
              onClick={() => onSelectTicker?.(item.ticker)}
              className="p-3.5 rounded-xl border border-border bg-muted/30 hover:border-primary/60 hover:bg-muted/60 transition text-left flex items-center justify-between"
            >
              <div>
                <span className="font-mono font-bold text-foreground text-sm">{item.ticker}</span>
                {item.name && (
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{item.name}</p>
                )}
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-foreground text-xs">
                  {formatCurrency(item.price, item.currency ?? 'ARS')}
                </span>
                <p
                  className={cn(
                    'text-[11px] font-mono font-bold mt-0.5',
                    isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  )}
                >
                  {isPos ? '+' : ''}
                  {item.variation.toFixed(2)}%
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
