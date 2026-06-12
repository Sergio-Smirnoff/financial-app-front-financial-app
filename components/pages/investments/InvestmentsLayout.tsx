'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BankFilter } from './BankFilter'

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

export function InvestmentsLayout() {
  const [tab, setTab] = useState('overview')
  const [bankNumber, setBankNumber] = useState<string | null>(null)
  const showBankFilter = tab === 'overview' || tab === 'holdings' || tab === 'performance'

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4 h-full flex flex-col overflow-hidden">
      <TabsList className="shrink-0">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="holdings">Holdings</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="markets">Markets</TabsTrigger>
        <TabsTrigger value="alerts">Alerts</TabsTrigger>
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
