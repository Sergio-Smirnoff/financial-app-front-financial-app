'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { TrendingUp } from 'lucide-react'
import { useMarketDiscovery } from '@/lib/hooks/useInvestments'
import { useFitCount } from '@/lib/hooks/useFitCount'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { MarketQuote } from '@/types/investments'

export interface MarketDiscoveryCardProps {
  onSelectTicker?: (ticker: string) => void
  className?: string
}

function DiscoveryList({ items, onSelectTicker }: { items: MarketQuote[]; onSelectTicker?: (ticker: string) => void }) {
  const { ref, count } = useFitCount<HTMLUListElement>(items.length)
  return (
    <ul ref={ref} data-testid="discovery-list" className="relative min-h-0 overflow-hidden frame:flex-1">
      {items.map((item, index) => {
        const isPos = item.variation >= 0
        return (
          <li
            key={item.ticker}
            data-testid="discovery-row"
            hidden={index >= count}
            className="flex items-baseline justify-between gap-3 border-b py-2 text-sm last:border-0"
          >
            <span className="min-w-0 truncate">
              <button
                type="button"
                onClick={() => onSelectTicker?.(item.ticker)}
                className="mr-1.5 font-mono font-bold text-primary hover:underline"
              >
                {item.ticker}
              </button>
              {item.name && <span className="text-xs text-muted-foreground">{item.name}</span>}
            </span>
            <span className="shrink-0 whitespace-nowrap font-mono text-xs">
              {formatCurrency(item.price, item.currency ?? 'ARS')}{' '}
              <span className={cn('font-bold', isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                {isPos ? '+' : ''}
                {item.variation.toFixed(2)}%
              </span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function MarketDiscoveryCard({ onSelectTicker, className }: MarketDiscoveryCardProps) {
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
    <div className={cn('flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm short:p-4', className)}>
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="font-bold text-sm text-foreground">{t('market.discoveryTitle')}</h3>
      </div>
      <DiscoveryList items={opportunities} onSelectTicker={onSelectTicker} />
    </div>
  )
}
