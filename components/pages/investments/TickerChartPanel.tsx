'use client'

import { useState } from 'react'
import { useTickerResearch } from '@/lib/hooks/useInvestments'
import { formatCurrency } from '@/lib/utils/currency'
import { PriceChart } from './PriceChart'

const RANGES = ['D30', 'D90', 'Y1', 'ALL'] as const

export function TickerChartPanel({ ticker }: { ticker: string }) {
  const [range, setRange] = useState<(typeof RANGES)[number]>('D90')
  const { data, isLoading, isError } = useTickerResearch(ticker, range)

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-xl font-bold">{ticker}</h2>
          {data?.currentPrice != null && (
            <span className="text-sm text-muted-foreground">
              {formatCurrency(data.currentPrice, data.currency ?? 'ARS')}
              {data.variation != null && (
                <span className={data.variation >= 0 ? 'text-green-500 ml-2' : 'text-red-500 ml-2'}>
                  {data.variation >= 0 ? '+' : ''}{data.variation}%
                </span>
              )}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {RANGES.map((rangeOption) => (
            <button
              key={rangeOption}
              onClick={() => setRange(rangeOption)}
              className={`text-xs font-bold px-3 py-1 rounded border ${
                range === rangeOption
                  ? 'border-primary text-foreground'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {rangeOption}
            </button>
          ))}
        </div>
      </div>
      {isLoading && <div className="h-52 rounded-xl bg-muted animate-pulse" />}
      {isError && <p className="text-sm text-red-500">Could not load price series.</p>}
      {data && <PriceChart series={data.series} currency={data.currency ?? 'ARS'} />}
    </div>
  )
}
