'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InvestmentsDashboard } from './InvestmentsDashboard'
import { HoldingsContent } from './HoldingsContent'

export function InvestmentsLayout() {
  const [tab, setTab] = useState<string>('dashboard')

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4 h-full flex flex-col overflow-hidden">
      <TabsList className="shrink-0">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="holdings">Holdings</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard" className="flex-1 overflow-auto">
        <InvestmentsDashboard />
      </TabsContent>

      <TabsContent value="holdings" className="flex-1 overflow-auto">
        <HoldingsContent />
      </TabsContent>
    </Tabs>
  )
}
