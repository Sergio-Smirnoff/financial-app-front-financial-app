'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { Money } from '@/components/ui-kit/money/Money'
import { DeltaBadge } from '@/components/ui-kit/money/DeltaBadge'
import { AreaChart } from '@/components/charts/AreaChart'
import type { OverviewBff, Section } from '@/lib/api/bff/types'

export type NetWorthData = NonNullable<NonNullable<OverviewBff['netWorth']>['data']>

export interface NetWorthHeroProps {
  section?: Section<NetWorthData>
  isLoading: boolean
  onRetry?: () => void
}

export function NetWorthHero({ section, isLoading, onRetry }: NetWorthHeroProps) {
  const t = useTranslations('overview')

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse frame:h-full" />}
    >
      {(data) => {
        const series = data.series ?? []
        const latestPoint = series[series.length - 1]
        const chartPoints = series.map((s) => ({
          date: s.date ?? '',
          value: parseFloat(s.value?.amount || '0'),
        }))

        return (
          <div className="elev-sm flex h-full min-h-0 flex-col gap-4 rounded-xl border bg-card p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="kicker">{t('netWorthKicker')}</span>
                <div className="flex items-baseline gap-3 mt-1">
                  {latestPoint && <Money value={latestPoint.value} className="text-3xl font-bold" />}
                  {data.delta?.pct != null && (
                    <DeltaBadge pct={data.delta.pct} absolute={data.delta.amount} />
                  )}
                </div>
              </div>
              {data.allTimeHigh && (
                <span className="tag tag-accent text-xs font-semibold px-2.5 py-1 rounded-full">
                  {t('allTimeHigh')}
                </span>
              )}
            </div>

            {chartPoints.length > 0 && (
              <div className="h-56 min-h-0 frame:h-auto frame:flex-1">
                <AreaChart
                  series={chartPoints}
                  currency={latestPoint?.value?.currency || 'ARS'}
                  ariaLabel={t('netWorthAria')}
                  minHeight={96}
                />
              </div>
            )}
          </div>
        )
      }}
    </SectionState>
  )
}
