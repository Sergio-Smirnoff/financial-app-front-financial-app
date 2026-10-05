'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { BarPairChart } from '@/components/charts/BarPairChart'
import type { OverviewBff, Section } from '@/lib/api/bff/types'

export type FlowItem = NonNullable<NonNullable<OverviewBff['flow']>['data']>[number]

export interface FlowCardProps {
  section?: Section<FlowItem[]>
  isLoading: boolean
  onRetry?: () => void
}

export function FlowCard({ section, isLoading, onRetry }: FlowCardProps) {
  const t = useTranslations('overview')

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse frame:h-full" />}
    >
      {(data) => {
        const months = data.map((item) => ({
          month: item.month ?? '',
          income: parseFloat(item.income?.amount || '0'),
          expense: parseFloat(item.expense?.amount || '0'),
        }))

        const currency = data[0]?.income?.currency || 'ARS'

        return (
          <div className="elev-sm flex h-full min-h-0 flex-col gap-4 rounded-xl border bg-card p-5">
            <h3 className="section-head">{t('flowTitle')}</h3>
            <div className="h-56 min-h-0 frame:h-auto frame:flex-1">
              <BarPairChart months={months} currency={currency} ariaLabel={t('flowAria')} minHeight={96} />
            </div>
          </div>
        )
      }}
    </SectionState>
  )
}
