'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { AreaChart } from '@/components/charts/AreaChart'
import { FitAmount } from '@/components/ui-kit/money/FitAmount'
import { EVOLUTION_RANGES, type EvolutionRange } from '@/lib/api/bff/investments'
import { formatPercent } from '@/lib/format'
import type { EvolutionPoint, InvestmentsKpis, Section } from '@/lib/api/bff/types'
import { cn } from '@/lib/utils'
import { toneOf } from './portfolioView'

export interface EvolutionCardProps {
  section?: Section<EvolutionPoint[]>
  kpis?: InvestmentsKpis | null
  range: EvolutionRange
  onRangeChange: (range: EvolutionRange) => void
  isLoading: boolean
  onRetry?: () => void
}

const RANGE_LABEL_KEYS = {
  '1M': 'market.ranges.1M',
  '3M': 'market.ranges.3M',
  '1A': 'market.ranges.1A',
} as const satisfies Record<EvolutionRange, string>

const TONE_TEXT = { gain: 'text-gain', loss: 'text-loss', neutral: 'text-muted-foreground' } as const

export function EvolutionCard({ section, kpis, range, onRangeChange, isLoading, onRetry }: EvolutionCardProps) {
  const t = useTranslations('investments')

  return (
    <div data-testid="evolution-card" className="elev-sm rounded-xl border bg-card p-5 flex h-full min-h-0 flex-col gap-4 max-md:p-3.5 short:gap-2 short:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="section-head">{t('market.evolutionHeading')}</h3>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2 w-2 rounded-full bg-primary" /> {t('shared.totalValue')}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full border border-dashed border-current" /> {t('totalInvested')}
          </span>
          <div role="group" aria-label={t('market.rangeAria')} className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1">
            {EVOLUTION_RANGES.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={r === range}
                onClick={() => onRangeChange(r)}
                className={cn(
                  'rounded px-2 py-0.5 text-xs font-medium transition-colors',
                  r === range ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t(RANGE_LABEL_KEYS[r])}
              </button>
            ))}
          </div>
        </div>
      </div>

      {kpis?.marketValue && (
        <div className="flex items-baseline gap-3">
          <FitAmount value={kpis.marketValue} className="min-w-0 flex-1 text-2xl font-bold short:text-xl" />
          {kpis.pnlPct != null && (
            <span className={cn('shrink-0 whitespace-nowrap text-xs font-semibold', TONE_TEXT[toneOf(kpis.pnlPct)])}>
              {formatPercent(kpis.pnlPct)}
            </span>
          )}
        </div>
      )}

      <SectionState
        section={section}
        isLoading={isLoading}
        onRetry={onRetry}
        emptyTitle={t('market.evolutionEmpty')}
        emptyTestId="evolution-empty"
        skeleton={<div className="h-56 min-h-0 rounded-lg bg-muted animate-pulse frame:h-auto frame:flex-1" />}
      >
        {(items) => (
          <div className="h-56 min-h-0 frame:h-auto frame:flex-1">
            <AreaChart
              minHeight={96}
              series={items.map((i) => ({ date: i.date ?? '', value: parseFloat(i.marketValue?.amount ?? '0') }))}
              comparison={items.map((i) => ({ date: i.date ?? '', value: parseFloat(i.cost?.amount ?? '0') }))}
              currency={items[0]?.marketValue?.currency ?? 'ARS'}
              ariaLabel={t('market.evolutionAria')}
            />
          </div>
        )}
      </SectionState>
    </div>
  )
}
