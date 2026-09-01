'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useOverviewPage } from '@/lib/hooks/useOverviewPage'
import { SplitLayout, RailSection } from '@/components/ui-kit/layout/KpiStrip'
import { NetWorthHero } from './NetWorthHero'
import { KpiRow } from './KpiRow'
import { BreakdownCard } from './BreakdownCard'
import { FlowCard } from './FlowCard'
import { CommittedCard } from './CommittedCard'
import { UpcomingRail } from './UpcomingRail'
import { SpendByCategoryCard } from './SpendByCategoryCard'
import { LatestMovementsCard } from './LatestMovementsCard'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import type { BffQuery, OverviewBff } from '@/lib/api/bff/types'

export interface OverviewContentProps {
  query?: BffQuery
  initialData?: OverviewBff
}

export function OverviewContent({ query = { currency: 'ARS', secondary: 'none' } }: OverviewContentProps) {
  const t = useTranslations('overview')
  const { data, isLoading, refetch } = useOverviewPage(query)

  const observedAt = data?.kpis?.observedAt

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        {observedAt && <FreshnessStamp observedAt={observedAt} />}
      </div>

      <KpiRow section={data?.kpis} isLoading={isLoading} onRetry={refetch} />

      <SplitLayout
        main={
          <div className="space-y-6">
            <NetWorthHero section={data?.netWorth} isLoading={isLoading} onRetry={refetch} />
            <FlowCard section={data?.flow} isLoading={isLoading} onRetry={refetch} />
            <div className="grid gap-6 md:grid-cols-2">
              <CommittedCard section={data?.committed} isLoading={isLoading} onRetry={refetch} />
              <BreakdownCard section={data?.breakdown} isLoading={isLoading} onRetry={refetch} />
            </div>
          </div>
        }
        rail={
          <div className="space-y-6">
            <RailSection title={t('railTitle')}>
              <div className="space-y-6">
                <UpcomingRail section={data?.upcomingPayments} isLoading={isLoading} onRetry={refetch} />
                <SpendByCategoryCard section={data?.spendByCategory} isLoading={isLoading} onRetry={refetch} />
                <LatestMovementsCard section={data?.latestMovements} isLoading={isLoading} onRetry={refetch} />
              </div>
            </RailSection>
          </div>
        }
      />
    </div>
  )
}
