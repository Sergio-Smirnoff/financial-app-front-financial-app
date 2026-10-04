'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useTickerResearch } from '@/lib/hooks/useInvestments'
import { formatCurrency, formatPercent } from '@/lib/format'
import { cn } from '@/lib/utils'
import { AreaChart } from '@/components/charts/AreaChart'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

const RANGES = ['D30', 'D90', 'Y1', 'ALL'] as const
type Range = (typeof RANGES)[number]

const RANGE_LABEL_KEYS: Record<Range, string> = {
  D30: 'market.ranges.D30',
  D90: 'market.ranges.D90',
  Y1: 'market.ranges.Y1',
  ALL: 'market.ranges.all',
}

export interface TickerChartPanelProps {
  ticker: string
  name?: string
  onBuy?: (ticker: string, currentPrice?: number | null, currency?: string) => void
  className?: string
}

export function TickerChartPanel({ ticker, name, onBuy, className }: TickerChartPanelProps) {
  const t = useTranslations('investments')
  const [range, setRange] = useState<Range>('D90')
  const { data, isLoading, isError } = useTickerResearch(ticker, range)

  const series = (data?.series ?? []).map((pt) => ({
    date: pt.date,
    value: pt.price,
  }))

  const isPos = (data?.variation ?? 0) >= 0

  return (
    <div className={cn('min-w-0 rounded-2xl border border-border bg-card p-6 flex flex-col gap-5 shadow-sm short:p-4 short:gap-3', className)}>
      <div
        data-testid="ticker-chart-head"
        className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/60 pb-4 short:gap-x-2 short:pb-3"
      >
        <div className="flex min-w-16 flex-1 basis-0 items-baseline gap-3 short:gap-2">
          <h2 className="shrink-0 text-2xl font-black font-mono tracking-tight text-foreground short:text-lg">{ticker}</h2>
          {name && (
            <span title={name} className="min-w-0 truncate text-sm text-muted-foreground">
              {name}
            </span>
          )}
        </div>

        <div
          role="group"
          aria-label={t('market.priceRangeAria')}
          className="flex shrink-0 gap-1 rounded-lg border border-border p-1 bg-muted/40 short:order-2"
        >
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => setRange(r)}
              className={cn(
                'whitespace-nowrap text-xs font-medium px-2.5 py-1 rounded transition-colors max-sm:px-2 short:px-1.5 short:py-0.5',
                range === r
                  ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t(RANGE_LABEL_KEYS[r])}
            </button>
          ))}
        </div>

        <div className="basis-full short:hidden" />

        {data?.currentPrice != null && (
          <div className="flex min-w-0 flex-1 items-baseline gap-3 short:order-1 short:flex-none">
            <span className="whitespace-nowrap text-xl font-black font-mono text-foreground short:text-base">
              {formatCurrency(data.currentPrice, data.currency ?? 'ARS')}
            </span>
            {data.variation != null && (
              <span
                className={cn(
                  'whitespace-nowrap text-xs font-mono font-bold px-2 py-0.5 rounded',
                  isPos
                    ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400'
                    : 'text-rose-600 bg-rose-500/10 dark:text-rose-400'
                )}
              >
                {formatPercent(data.variation)}
              </span>
            )}
          </div>
        )}

        {onBuy && (
          <Button
            size="sm"
            onClick={() => onBuy(ticker, data?.currentPrice, data?.currency ?? 'ARS')}
            className="shrink-0 font-bold flex items-center gap-1.5 max-sm:w-full short:order-3"
          >
            <Plus className="w-4 h-4" />
            <span className="short:hidden">{t('market.addHoldingFor', { ticker })}</span>
            <span className="hidden short:inline">{t('market.buyShort', { ticker })}</span>
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="h-56 rounded-xl bg-muted animate-pulse frame:h-auto frame:flex-1" />
      )}

      {isError && (
        <p className="text-sm text-destructive">{t('market.seriesError')}</p>
      )}

      {data && series.length > 0 && (
        <div className="h-56 min-h-0 frame:h-auto frame:flex-1">
          <AreaChart
            series={series}
            currency={data.currency ?? 'ARS'}
            ariaLabel={t('market.priceChartAria', { ticker })}
            minHeight={96}
          />
        </div>
      )}
    </div>
  )
}
