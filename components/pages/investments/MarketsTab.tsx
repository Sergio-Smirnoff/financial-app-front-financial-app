'use client'

import { MarketDiscoveryCard } from './MarketDiscoveryCard'
import { TickerSearchBox } from './TickerSearchBox'
import { TopMovers } from '@/components/pages/dashboard/TopMovers'
import { usePortfolioHoldings } from '@/lib/hooks/useInvestments'

interface MarketsTabProps {
  enabled?: boolean
}

export function MarketsTab({ enabled }: MarketsTabProps) {
  const { data: holdings = [] } = usePortfolioHoldings({ enabled: !!enabled })
  if (!enabled) return null
  return (
    <div className="space-y-4">
      <TickerSearchBox />
      <MarketDiscoveryCard />
      <TopMovers holdings={holdings} />
    </div>
  )
}
