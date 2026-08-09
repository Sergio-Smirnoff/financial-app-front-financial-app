'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { Money } from '@/components/ui-kit/money/Money'
import { DeltaBadge } from '@/components/ui-kit/money/DeltaBadge'
import { AreaChart } from '@/components/charts/AreaChart'
import type { Section } from '@/lib/api/bff/types'
import type { MoneyView } from '@/lib/format'

export interface NetWorthData {
  series: { date: string; value: MoneyView }[]
  delta: { amount: MoneyView; pct: number }
  allTimeHigh: boolean
}

export interface NetWorthHeroProps {
  section?: Section<NetWorthData>
  isLoading: boolean
  onRetry?: () => void
}

export function NetWorthHero({ section, isLoading, onRetry }: NetWorthHeroProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
    >
      {(data) => {
        const latestPoint = data.series[data.series.length - 1]
        const chartPoints = data.series.map((s) => ({
          date: s.date,
          value: parseFloat(s.value.amount || '0'),
        }))

        return (
          <div className="elev-sm rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="kicker">Patrimonio Neto</span>
                <div className="flex items-baseline gap-3 mt-1">
                  {latestPoint && <Money value={latestPoint.value} className="text-3xl font-bold" />}
                  <DeltaBadge pct={data.delta.pct} absolute={data.delta.amount} />
                </div>
              </div>
              {data.allTimeHigh && (
                <span className="tag tag-accent text-xs font-semibold px-2.5 py-1 rounded-full">
                  ★ Máximo histórico
                </span>
              )}
            </div>

            {chartPoints.length > 0 && (
              <div className="pt-2">
                <AreaChart
                  data={chartPoints}
                  currency={latestPoint?.value.currency || 'ARS'}
                  ariaLabel="Evolución del patrimonio neto"
                />
              </div>
            )}
          </div>
        )
      }}
    </SectionState>
  )
}
