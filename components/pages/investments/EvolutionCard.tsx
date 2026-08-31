'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { AreaChart } from '@/components/charts/AreaChart'
import type { Section } from '@/lib/api/bff/types'

export interface EvolutionPoint {
  date?: string
  marketValue?: { amount?: string; currency?: string; secondary?: any }
  cost?: { amount?: string; currency?: string; secondary?: any }
}

export interface EvolutionCardProps {
  section?: Section<EvolutionPoint[]>
  isLoading: boolean
  onRetry?: () => void
}

export function EvolutionCard({ section, isLoading, onRetry }: EvolutionCardProps) {
  const t = useTranslations('investments')

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
    >
      {(items) => {
        if (items.length === 0) {
          return (
            <div className="elev-sm rounded-xl border bg-card p-5">
              <h3 className="section-head">{t('market.evolutionHeading')}</h3>
              <p className="text-sm text-muted-foreground mt-2">{t('market.evolutionEmpty')}</p>
            </div>
          )
        }

        const points = items.map((i) => ({
          date: i.date ?? '',
          value: parseFloat(i.marketValue?.amount ?? '0'),
        }))
        const comparisonPoints = items.map((i) => ({
          date: i.date ?? '',
          value: parseFloat(i.cost?.amount ?? '0'),
        }))

        return (
          <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="section-head">{t('market.evolutionHeading')}</h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-primary" /> {t('shared.totalValue')}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full border border-dashed border-current" /> {t('totalInvested')}
                </span>
              </div>
            </div>

            <AreaChart
              series={points}
              comparison={comparisonPoints}
              ariaLabel={t('market.evolutionAria')}
            />
          </div>
        )
      }}
    </SectionState>
  )
}
