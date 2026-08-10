'use client'

import React from 'react'
import { useQueryState } from 'nuqs'
import { useInvestmentsPage } from '@/lib/hooks/useInvestmentsPage'
import { KpiStrip, KpiTile, SplitLayout, RailSection } from '@/components/ui-kit/layout/KpiStrip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { MarketStrip } from '@/components/ui-kit/page/investments/MarketStrip'
import { Money } from '@/components/ui-kit/money/Money'
import { DeltaBadge } from '@/components/ui-kit/money/DeltaBadge'
import { PortfolioTab } from './PortfolioTab'
import { OperationsTab } from './OperationsTab'
import { EvolutionCard } from './EvolutionCard'
import { AlertsRail } from './AlertsRail'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import type { BffQuery, InvestmentsBff } from '@/lib/api/bff/types'

export interface InvestmentsContentProps {
  query?: BffQuery
  initialData?: InvestmentsBff
}

export function InvestmentsContent({ query = { currency: 'ARS', secondary: 'none' } }: InvestmentsContentProps) {
  const [tab, setTab] = useQueryState('tab', { defaultValue: 'portfolio' })
  const { data, isLoading, refetch } = useInvestmentsPage(query)

  const summary = data?.summary
  const holdingsData = data?.holdings
  const allocationData = data?.allocation

  const marketQuotes = [
    { code: 'RIESGO_PAIS', label: 'Riesgo País', value: '742', variation: -12, unit: 'POINTS' as const, observedAt: new Date().toISOString() },
    { code: 'MERVAL', label: 'Merval ARS', value: '1.450.000', variation: 1.2, unit: 'PERCENT' as const, observedAt: new Date().toISOString() },
  ]

  const mockOperations = [
    { id: '1', date: '12/07', ticker: 'GGAL', kind: 'Compra' as const, quantity: 50, price: { amount: '4200', currency: 'ARS', secondary: null }, total: { amount: '210000', currency: 'ARS', secondary: null } },
  ]

  const mockAlerts = [
    { id: '1', ticker: 'YPFD', message: 'YPFD +8%', tone: 'info' as const },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inversiones</h1>
          <p className="text-sm text-muted-foreground">Portafolio, cotizaciones y rendimiento</p>
        </div>
        {summary?.observedAt && <FreshnessStamp observedAt={summary.observedAt} />}
      </div>

      <div data-testid="market-strip">
        <MarketStrip quotes={marketQuotes} />
      </div>

      <SectionState
        section={summary}
        isLoading={isLoading}
        onRetry={refetch}
        skeleton={<div className="h-24 rounded-lg bg-muted animate-pulse" />}
      >
        {(sData) => (
          <KpiStrip>
            <KpiTile label="Total invertido" value={<Money value={sData.totalInvested} />} />
            <KpiTile
              label="Resultado P&L"
              value={<DeltaBadge pct={sData.totalPnl.pct} absolute={sData.totalPnl.amount} />}
            />
          </KpiStrip>
        )}
      </SectionState>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="portfolio">Cartera</TabsTrigger>
          <TabsTrigger value="operations">Operaciones</TabsTrigger>
        </TabsList>

        <SplitLayout
          main={
            <div className="space-y-6">
              <TabsContent value="portfolio" className="m-0 focus-visible:outline-none space-y-6">
                <PortfolioTab
                  holdingsSection={holdingsData}
                  allocationSection={allocationData}
                  isLoading={isLoading}
                  onRetry={refetch}
                />
                <EvolutionCard
                  section={{
                    status: 'OK',
                    observedAt: new Date().toISOString(),
                    data: [
                      { date: '2026-07-01', value: 1200000, cost: 1000000 },
                      { date: '2026-08-01', value: 1500000, cost: 1250000 },
                    ],
                  }}
                  isLoading={false}
                />
              </TabsContent>

              <TabsContent value="operations" className="m-0 focus-visible:outline-none">
                <OperationsTab
                  section={{ status: 'OK', observedAt: new Date().toISOString(), data: mockOperations }}
                  isLoading={false}
                />
              </TabsContent>
            </div>
          }
          rail={
            <div className="space-y-6">
              <RailSection title="Notificaciones">
                <AlertsRail
                  section={{ status: 'OK', observedAt: new Date().toISOString(), data: mockAlerts }}
                  isLoading={false}
                />
              </RailSection>
            </div>
          }
        />
      </Tabs>
    </div>
  )
}
