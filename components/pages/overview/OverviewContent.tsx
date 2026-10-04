'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useOverviewPage } from '@/lib/hooks/useOverviewPage'
import { useSection } from '@/lib/hooks/useSection'
import { cn } from '@/lib/utils'
import { RailSection } from '@/components/ui-kit/layout/KpiStrip'
import { PageFrameFill } from '@/components/ui-kit/layout/PageFrame'
import { NetWorthHero } from './NetWorthHero'
import { KpiRow } from './KpiRow'
import { BreakdownCard } from './BreakdownCard'
import { FlowCard } from './FlowCard'
import { CommittedCard } from './CommittedCard'
import { UpcomingRail } from './UpcomingRail'
import { SpendByCategoryCard } from './SpendByCategoryCard'
import { LatestMovementsCard } from './LatestMovementsCard'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import type { BffQuery, OverviewBff, Section } from '@/lib/api/bff/types'

const RAIL_LIST_SHARE = 'flex flex-col frame:flex-1 frame:basis-0 short:hidden'

function useRailListShare<T>(section: Section<T> | undefined, isLoading: boolean): string {
  const { state } = useSection(section, isLoading)
  const fitsShare = state === 'ready' || state === 'loading'
  return cn(RAIL_LIST_SHARE, fitsShare && 'frame:min-h-16')
}

export interface OverviewContentProps {
  query?: BffQuery
  initialData?: OverviewBff
}

export function OverviewContent({ query = { currency: 'ARS', secondary: 'none' } }: OverviewContentProps) {
  const t = useTranslations('overview')
  const { data, isLoading, refetch } = useOverviewPage(query)

  const observedAt = data?.kpis?.observedAt
  const spendShare = useRailListShare(data?.spendByCategory, isLoading)
  const latestShare = useRailListShare(data?.latestMovements, isLoading)

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight short:text-xl">{t('title')}</h1>
          <p className="text-sm text-muted-foreground short:hidden">{t('subtitle')}</p>
        </div>
        {observedAt && <FreshnessStamp observedAt={observedAt} />}
      </div>

      <KpiRow section={data?.kpis} isLoading={isLoading} onRetry={refetch} />

      <PageFrameFill>
        <div
          data-testid="overview-grid"
          className="grid gap-6 max-md:gap-4.5 @min-[852px]/page:grid-cols-[minmax(0,1fr)_20rem] frame:h-full frame:gap-4 frame:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_330px] frame:grid-rows-[minmax(0,1fr)_auto] short:grid-cols-[minmax(0,1fr)_330px] short:gap-3"
        >
          <div data-testid="overview-area-net-worth" className="min-w-0 @min-[852px]/page:col-start-1 frame:col-start-1 frame:row-start-1 frame:min-h-0">
            <NetWorthHero section={data?.netWorth} isLoading={isLoading} onRetry={refetch} />
          </div>
          <div data-testid="overview-area-flow" className="min-w-0 @min-[852px]/page:col-start-1 frame:col-start-2 frame:row-start-1 frame:min-h-0 short:hidden">
            <FlowCard section={data?.flow} isLoading={isLoading} onRetry={refetch} />
          </div>
          <div data-testid="overview-area-committed" className="min-w-0 @min-[852px]/page:col-start-1 frame:col-start-1 frame:row-start-2 short:hidden">
            <CommittedCard section={data?.committed} isLoading={isLoading} onRetry={refetch} />
          </div>
          <div data-testid="overview-area-breakdown" className="min-w-0 @min-[852px]/page:col-start-1 frame:col-start-2 frame:row-start-2 short:col-start-1">
            <BreakdownCard section={data?.breakdown} isLoading={isLoading} onRetry={refetch} />
          </div>
          <aside
            data-testid="overview-rail"
            className="min-w-0 @min-[852px]/page:col-start-2 @min-[852px]/page:row-span-4 @min-[852px]/page:row-start-1 frame:col-start-3 frame:row-span-2 frame:row-start-1 frame:min-h-0 short:col-start-2"
          >
            <RailSection title={t('railTitle')} className="flex flex-col frame:h-full frame:min-h-0">
              <div className="flex flex-col gap-6 max-md:gap-4.5 frame:min-h-0 frame:flex-1 frame:gap-3">
                <UpcomingRail
                  section={data?.upcomingPayments}
                  isLoading={isLoading}
                  onRetry={refetch}
                  className="frame:max-h-1/2 short:max-h-none"
                />
                <Link
                  href="/transactions"
                  data-testid="overview-latest-link"
                  className="hidden self-start rounded-md border px-3 py-1.5 text-xs font-medium text-primary hover:bg-muted short:inline-flex"
                >
                  {t('latest.more')}
                </Link>
                <div data-testid="overview-rail-spend" className={spendShare}>
                  <SpendByCategoryCard section={data?.spendByCategory} isLoading={isLoading} onRetry={refetch} />
                </div>
                <div data-testid="overview-rail-latest" className={latestShare}>
                  <LatestMovementsCard section={data?.latestMovements} isLoading={isLoading} onRetry={refetch} />
                </div>
              </div>
            </RailSection>
          </aside>
        </div>
      </PageFrameFill>
    </>
  )
}
