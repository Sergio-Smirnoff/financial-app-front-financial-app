'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useTickerResearch } from '@/lib/hooks/useInvestments'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { AreaChart } from '@/components/charts/AreaChart'

const RANGES = ['D30', 'D90', 'Y1', 'ALL'] as const

type Range = (typeof RANGES)[number]

const RANGE_LABEL_KEYS: Partial<Record<Range, 'market.ranges.all'>> = {
  ALL: 'market.ranges.all',
}

export function TickerChartPanel({ ticker }: { ticker: string }) {
  const t = useTranslations('investments')
  const [range, setRange] = useState<Range>('D90')
  const { data, isLoading, isError } = useTickerResearch(ticker, range)

  const series = (data?.series ?? []).map((pt) => ({
    date: pt.date,
    value: pt.price,
  }))

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-b from-muted/40 to-card p-5 space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-2xl font-black tracking-tight">{ticker}</h2>
          {data?.currentPrice != null && (
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-sm font-medium text-muted-foreground">
                {formatCurrency(data.currentPrice, data.currency ?? 'ARS')}
              </span>
              {data.variation != null && (
                <span
                  className={cn(
                    'text-xs font-bold',
                    data.variation >= 0 ? 'text-green-500' : 'text-red-500',
                  )}
                >
                  {data.variation >= 0 ? '+' : ''}
                  {data.variation.toFixed(2)}%
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          {RANGES.map((rangeOption) => {
            const labelKey = RANGE_LABEL_KEYS[rangeOption]
            return (
              <button
                key={rangeOption}
                type="button"
                onClick={() => setRange(rangeOption)}
                className={cn(
                  'text-xs font-bold px-2.5 py-1 rounded-full border transition-colors',
                  range === rangeOption
                    ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30 ring-inset'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
                )}
              >
                {labelKey ? t(labelKey) : rangeOption}
              </button>
            )
          })}
        </div>
      </div>
      {isLoading && <div className="h-[220px] rounded-xl bg-muted animate-pulse" />}
      {isError && <p className="text-sm text-destructive">{t('market.seriesError')}</p>}
      {data && (
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
