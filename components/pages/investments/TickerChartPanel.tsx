'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useTickerResearch } from '@/lib/hooks/useInvestments'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { AreaChart } from '@/components/charts/AreaChart'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const RANGES = ['D30', 'D90', 'Y1', 'ALL'] as const
type Range = (typeof RANGES)[number]

export interface TickerChartPanelProps {
  ticker: string
  name?: string
  onBuy?: (ticker: string, currentPrice?: number | null, currency?: string) => void
}

export function TickerChartPanel({ ticker, name, onBuy }: TickerChartPanelProps) {
  const t = useTranslations('investments')
  const [range, setRange] = useState<Range>('D90')
  const { data, isLoading, isError } = useTickerResearch(ticker, range)

  const series = (data?.series ?? []).map((pt) => ({
    date: pt.date,
    value: pt.price,
  }))

  const isPos = (data?.variation ?? 0) >= 0

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black font-mono tracking-tight text-foreground">{ticker}</h2>
            {name && <span className="text-sm text-muted-foreground">{name}</span>}
          </div>

          {data?.currentPrice != null && (
            <div className="flex items-baseline gap-3 mt-1.5">
              <span className="text-xl font-black font-mono text-foreground">
                {formatCurrency(data.currentPrice, data.currency ?? 'ARS')}
              </span>
              {data.variation != null && (
                <span
                  className={cn(
                    'text-xs font-mono font-bold px-2 py-0.5 rounded',
                    isPos
                      ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400'
                      : 'text-rose-600 bg-rose-500/10 dark:text-rose-400'
                  )}
                >
                  {isPos ? '+' : ''}
                  {data.variation.toFixed(2)}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Range selectors & Buy button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-lg border border-border p-1 bg-muted/40">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded transition-colors',
                  range === r
                    ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {r === 'ALL' ? t('market.ranges.all') : r}
              </button>
            ))}
          </div>

          {onBuy && (
            <Button
              size="sm"
              onClick={() => onBuy(ticker, data?.currentPrice, data?.currency ?? 'ARS')}
              className="font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              {t('market.addHoldingFor', { ticker })}
            </Button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="h-[220px] rounded-xl bg-muted animate-pulse" />
      )}

      {isError && (
        <p className="text-sm text-destructive">{t('market.seriesError')}</p>
      )}

      {data && series.length > 0 && (
        <AreaChart
          series={series}
          currency={data.currency ?? 'ARS'}
          ariaLabel={t('market.priceChartAria', { ticker })}
          height={220}
        />
      )}
    </div>
  )
}
