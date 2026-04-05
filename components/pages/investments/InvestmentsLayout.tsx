'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InvestmentsDashboard } from './InvestmentsDashboard'
import { HoldingsContent } from './HoldingsContent'

interface InvestmentsLayoutProps {
  defaultTab: 'dashboard' | 'holdings'
}

export function InvestmentsLayout({ defaultTab }: InvestmentsLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  const currentTab = pathname.includes('/holdings') ? 'holdings' : 'dashboard'

  const handleTabChange = (value: string) => {
    if (value === 'dashboard') router.push('/investments')
    else router.push('/investments/holdings')
  }

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
      <TabsList>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="holdings">Holdings</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <InvestmentsDashboard />
      </TabsContent>

      <TabsContent value="holdings">
        <HoldingsContent />
      </TabsContent>
    </Tabs>
  )
}
