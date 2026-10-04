'use client'

import React, { useEffect } from 'react'
import { parseAsStringLiteral, useQueryState } from 'nuqs'
import { useTranslations } from 'next-intl'
import { useInvestmentsPage } from '@/lib/hooks/useInvestmentsPage'
import { EVOLUTION_RANGES } from '@/lib/api/bff/investments'
import { KpiStrip, KpiTile } from '@/components/ui-kit/layout/KpiStrip'
import { PageFrameFill } from '@/components/ui-kit/layout/PageFrame'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { MarketStrip } from '@/components/ui-kit/page/investments/MarketStrip'
import { FitAmount } from '@/components/ui-kit/money/FitAmount'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import { PortfolioTab } from './PortfolioTab'
import { OperationsTab } from './OperationsTab'
import { MarketsTab } from './MarketsTab'
import { ResumenTab } from './ResumenTab'
import { resolveInvestmentsTab } from './tabs'
import { useHoldingDraftStore } from '@/lib/store/holdingDraft.store'
import type { BffQuery, InvestmentsBff } from '@/lib/api/bff/types'
import type { components } from '@/lib/api/bff/schema'

type MarketQuote = components['schemas']['MarketQuoteResponse']

const PANEL = 'm-0 min-h-0 focus-visible:outline-none'
const TAB = 'max-md:min-w-0 max-md:px-1 max-md:text-xs'

export interface InvestmentsContentProps {
  query?: BffQuery
  initialData?: InvestmentsBff
}

export function InvestmentsContent({ query = { currency: 'ARS', secondary: 'none' } }: InvestmentsContentProps) {
  const t = useTranslations('investments')
  const [rawTab, setTab] = useQueryState('tab')
  const [range, setRange] = useQueryState('range', parseAsStringLiteral(EVOLUTION_RANGES).withDefault('1M'))
  const [addTicker, setAddTicker] = useQueryState('add')
  const tab = resolveInvestmentsTab(rawTab)
  const openCreate = useHoldingDraftStore((s) => s.openCreate)

  useEffect(() => {
    if (!addTicker) return
    openCreate({ ticker: addTicker.toUpperCase() })
    void setTab('cartera')
    void setAddTicker(null)
  }, [addTicker, openCreate, setTab, setAddTicker])

  const { data, isLoading, refetch } = useInvestmentsPage({ ...query, range })

  const marketStrip = data?.marketStrip
  const kpis = data?.kpis
  const evolution = data?.evolution
  const positions = data?.positions
  const composition = data?.composition
  const recentOperations = data?.recentOperations
  const alerts = data?.alerts

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 short:gap-2">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight short:text-xl">{t('title')}</h1>
          <p className="text-sm text-muted-foreground short:hidden">{t('subtitle')}</p>
        </div>
        {kpis?.observedAt && <FreshnessStamp observedAt={kpis.observedAt} />}
      </div>

      {marketStrip?.status !== 'UNAVAILABLE' && (
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
                quotes={(quotes || []).map((q: MarketQuote) => ({
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
      )}

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
              value={<div data-testid="inv-kpi-market-value"><FitAmount value={kpisData?.marketValue} /></div>}
            />
            <KpiTile
              label={t('totalInvested')}
              value={<div data-testid="inv-kpi-cost"><FitAmount value={kpisData?.cost} /></div>}
            />
            <KpiTile
              label={t('totalPnl')}
              value={<div data-testid="inv-kpi-pnl"><FitAmount value={kpisData?.pnl} /></div>}
            />
            <KpiTile
              label={t('tabs.kpiPerformance')}
              value={
                <span data-testid="inv-kpi-pnl-pct" className={`block whitespace-nowrap ${kpisData?.pnlPct != null && kpisData.pnlPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                  {kpisData?.pnlPct != null ? `${kpisData.pnlPct >= 0 ? '+' : ''}${kpisData.pnlPct.toFixed(2)}%` : '—'}
                </span>
              }
            />
          </KpiStrip>
        )}
      </SectionState>

      <PageFrameFill className="flex flex-col">
        <Tabs value={tab} onValueChange={(value) => void setTab(value)} className="flex-1 min-h-0 gap-3">
          <TabsList className="max-md:w-full">
            <TabsTrigger value="resumen" className={TAB}>{t('tabs.summary')}</TabsTrigger>
            <TabsTrigger value="cartera" className={TAB}>{t('portfolio')}</TabsTrigger>
            <TabsTrigger value="mercados" className={TAB}>{t('tabs.markets')}</TabsTrigger>
            <TabsTrigger value="operaciones" className={TAB}>{t('tabs.operations')}</TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className={PANEL}>
            <ResumenTab
              composition={composition}
              kpis={kpis?.data}
              evolution={evolution}
              alerts={alerts}
              range={range}
              onRangeChange={(next) => void setRange(next)}
              isLoading={isLoading}
              onRetry={refetch}
            />
          </TabsContent>

          <TabsContent value="cartera" className={PANEL}>
            <PortfolioTab
              positionsSection={positions}
              compositionSection={composition}
              kpis={kpis?.data}
              isLoading={isLoading}
              onRetry={refetch}
            />
          </TabsContent>

          <TabsContent value="mercados" className={PANEL}>
            <MarketsTab
              onBuy={(prefill) => {
                openCreate(prefill)
                void setTab('cartera')
              }}
            />
          </TabsContent>

          <TabsContent value="operaciones" className={PANEL}>
            <OperationsTab section={recentOperations} isLoading={isLoading} onRetry={refetch} />
          </TabsContent>
        </Tabs>
      </PageFrameFill>
    </>
  )
}
