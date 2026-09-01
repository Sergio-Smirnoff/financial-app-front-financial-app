'use client'

import React from 'react'
import { useQueryState } from 'nuqs'
import { useTranslations } from 'next-intl'
import { useInvestmentsPage } from '@/lib/hooks/useInvestmentsPage'
import { KpiStrip, KpiTile, SplitLayout, RailSection } from '@/components/ui-kit/layout/KpiStrip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { MarketStrip } from '@/components/ui-kit/page/investments/MarketStrip'
import { Money } from '@/components/ui-kit/money/Money'
import { PortfolioTab } from './PortfolioTab'
import { OperationsTab } from './OperationsTab'
import { EvolutionCard } from './EvolutionCard'
import { AlertsRail } from './AlertsRail'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import type { BffQuery, InvestmentsBff, Section } from '@/lib/api/bff/types'

export interface InvestmentsContentProps {
  query?: BffQuery
  initialData?: InvestmentsBff
}

export function InvestmentsContent({ query = { currency: 'ARS', secondary: 'none' } }: InvestmentsContentProps) {
  const t = useTranslations('investments')
  const tc = useTranslations('common')
  const [tab, setTab] = useQueryState('tab', { defaultValue: 'portfolio' })
  const { data, isLoading, refetch } = useInvestmentsPage(query)

  const marketStrip = data?.marketStrip as Section<any[]> | undefined
  const kpis = data?.kpis as Section<any> | undefined
  const evolution = data?.evolution as Section<any[]> | undefined
  const positions = data?.positions as Section<any[]> | undefined
  const composition = data?.composition as Section<any[]> | undefined
  const recentOperations = data?.recentOperations as Section<any[]> | undefined
  const alerts = data?.alerts as Section<any[]> | undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        {kpis?.observedAt && <FreshnessStamp observedAt={kpis.observedAt} />}
      </div>

      <SectionState
        section={marketStrip}
        isLoading={isLoading}
        onRetry={refetch}
        skeleton={<div className="h-12 rounded-lg bg-muted animate-pulse" />}
      >
        {(quotes, observedAt) => (
          <div data-testid="market-strip">
            <MarketStrip
              observedAt={observedAt}
              quotes={(quotes || []).map((q: any) => ({
                code: q.code ?? '',
                label: q.label ?? '',
                value: String(q.value ?? ''),
                variation: q.variation ?? 0,
                unit: (q.unit ?? 'PERCENT') as 'PERCENT' | 'POINTS',
                observedAt: q.observedAt ?? observedAt,
              }))}
            />
          </div>
        )}
      </SectionState>

      <SectionState
        section={kpis}
        isLoading={isLoading}
        onRetry={refetch}
        skeleton={<div className="h-24 rounded-lg bg-muted animate-pulse" />}
      >
        {(kpisData) => (
          <KpiStrip>
            <KpiTile
              label={t('tabs.kpiMarketValue')}
              value={<span data-testid="inv-kpi-market-value">{kpisData?.marketValue && <Money value={kpisData.marketValue} />}</span>}
            />
            <KpiTile
              label={t('totalInvested')}
              value={<span data-testid="inv-kpi-cost">{kpisData?.cost && <Money value={kpisData.cost} />}</span>}
            />
            <KpiTile
              label={t('totalPnl')}
              value={<span data-testid="inv-kpi-pnl">{kpisData?.pnl && <Money value={kpisData.pnl} />}</span>}
            />
            <KpiTile
              label={t('tabs.kpiPerformance')}
              value={
                <span data-testid="inv-kpi-pnl-pct" className={kpisData?.pnlPct != null && kpisData.pnlPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}>
                  {kpisData?.pnlPct != null ? `${kpisData.pnlPct >= 0 ? '+' : ''}${kpisData.pnlPct.toFixed(2)}%` : '—'}
                </span>
              }
            />
          </KpiStrip>
        )}
      </SectionState>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="portfolio">{t('portfolio')}</TabsTrigger>
          <TabsTrigger value="operations">{t('tabs.operations')}</TabsTrigger>
        </TabsList>

        <SplitLayout
          main={
            <div className="space-y-6">
              <TabsContent value="portfolio" className="m-0 focus-visible:outline-none space-y-6">
                <PortfolioTab
                  positionsSection={positions}
                  compositionSection={composition}
                  isLoading={isLoading}
                  onRetry={refetch}
                />
                <EvolutionCard
                  section={evolution}
                  isLoading={isLoading}
                  onRetry={refetch}
                />
              </TabsContent>

              <TabsContent value="operations" className="m-0 focus-visible:outline-none">
                <OperationsTab
                  section={recentOperations}
                  isLoading={isLoading}
                  onRetry={refetch}
                />
              </TabsContent>
            </div>
          }
          rail={
            <div className="space-y-6">
              <RailSection title={tc('notifications')}>
                <AlertsRail
                  section={alerts}
                  isLoading={isLoading}
                  onRetry={refetch}
                />
              </RailSection>
            </div>
          }
        />
      </Tabs>
    </div>
  )
}
