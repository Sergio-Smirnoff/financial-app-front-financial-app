'use client'

import { ActiveAlertsCard } from './ActiveAlertsCard'
import { usePortfolioHoldings } from '@/lib/hooks/useInvestments'

interface AlertsTabProps {
  enabled?: boolean
}

export function AlertsTab({ enabled }: AlertsTabProps) {
  const { data: holdings = [] } = usePortfolioHoldings({ enabled: !!enabled })
  if (!enabled) return null
  return <ActiveAlertsCard holdings={holdings} />
}
