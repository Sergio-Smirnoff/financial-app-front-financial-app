'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { BankFilter } from './BankFilter'
import { usePortfolioHoldings } from '@/lib/hooks/useInvestments'

const InvestmentsDashboard = dynamic(
  () => import('./InvestmentsDashboard').then((m) => ({ default: m.InvestmentsDashboard })),
  { ssr: false },
)

const HoldingsContent = dynamic(
  () => import('./HoldingsContent').then((m) => ({ default: m.HoldingsContent })),
  { ssr: false },
)

const PerformanceTab = dynamic(
  () => import('./PerformanceTab').then((m) => ({ default: m.PerformanceTab })),
  { ssr: false },
)

const MarketsTab = dynamic(
  () => import('./MarketsTab').then((m) => ({ default: m.MarketsTab })),
  { ssr: false },
)

const AlertsTab = dynamic(
  () => import('./AlertsTab').then((m) => ({ default: m.AlertsTab })),
  { ssr: false },
)

function useActiveAlertsCount() {
  const { data: holdings = [] } = usePortfolioHoldings()
  return holdings.filter(
    (h) => h.notifyGainThresholdPct != null || h.notifyLossThresholdPct != null,
  ).length
}

export function InvestmentsLayout() {
  const [tab, setTab] = useState('overview')
  const [bankNumber, setBankNumber] = useState<string | null>(null)
  const showBankFilter = tab === 'overview' || tab === 'holdings' || tab === 'performance'
  const alertsCount = useActiveAlertsCount()

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4 h-full flex flex-col overflow-hidden">
      <TabsList
        variant="line"
        className="shrink-0 w-full justify-start border-b border-border rounded-none pb-0 h-auto gap-0"
      >
        {(
          [
            { value: 'overview', label: 'Overview' },
            { value: 'holdings', label: 'Holdings' },
            { value: 'performance', label: 'Performance' },
            { value: 'markets', label: 'Markets' },
            { value: 'alerts', label: 'Alerts' },
          ] as const
        ).map(({ value, label }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="
              rounded-none px-4 pb-3 pt-1 text-sm font-medium
              text-muted-foreground
              data-[state=active]:text-foreground
              data-[state=active]:border-b-2
              data-[state=active]:border-primary
              data-[state=active]:shadow-none
              hover:text-foreground
              transition-colors
              gap-1.5
            "
          >
            {label}
            {value === 'alerts' && alertsCount > 0 && (
              <Badge
                variant="default"
                className="h-4 min-w-4 px-1 text-[10px] leading-none"
              >
                {alertsCount}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {showBankFilter && <BankFilter value={bankNumber} onChange={setBankNumber} />}

      <TabsContent value="overview" className="flex-1 overflow-auto">
        <InvestmentsDashboard enabled={tab === 'overview'} bankNumber={bankNumber} />
      </TabsContent>
      <TabsContent value="holdings" className="flex-1 overflow-auto">
        <HoldingsContent enabled={tab === 'holdings'} bankNumber={bankNumber} />
      </TabsContent>
      <TabsContent value="performance" className="flex-1 overflow-auto">
        <PerformanceTab enabled={tab === 'performance'} />
      </TabsContent>
      <TabsContent value="markets" className="flex-1 overflow-auto">
        <MarketsTab enabled={tab === 'markets'} />
      </TabsContent>
      <TabsContent value="alerts" className="flex-1 overflow-auto">
        <AlertsTab enabled={tab === 'alerts'} />
      </TabsContent>
    </Tabs>
  )
}
