'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const InvestmentsDashboard = dynamic(
  () => import('./InvestmentsDashboard').then((m) => ({ default: m.InvestmentsDashboard })),
  { ssr: false },
)

const HoldingsContent = dynamic(
  () => import('./HoldingsContent').then((m) => ({ default: m.HoldingsContent })),
  { ssr: false },
)

export function InvestmentsLayout() {
  const [tab, setTab] = useState<string>('dashboard')

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4 h-full flex flex-col overflow-hidden">
      <TabsList className="shrink-0">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="holdings">Holdings</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="flex-1 overflow-auto">
        <InvestmentsDashboard enabled={tab === 'dashboard'} />
      </TabsContent>

      <TabsContent value="holdings" className="flex-1 overflow-auto">
        <HoldingsContent enabled={tab === 'holdings'} />
      </TabsContent>
    </Tabs>
  )
}
