'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MarketDiscoveryCard } from './MarketDiscoveryCard'
import { TickerSearchBox } from './TickerSearchBox'
import { TickerChartPanel } from './TickerChartPanel'
import { TopMovers } from '@/components/pages/dashboard/TopMovers'
import { Button } from '@/components/ui/button'
import { usePortfolioHoldings } from '@/lib/hooks/useInvestments'

interface MarketsTabProps {
  enabled?: boolean
}

export function MarketsTab({ enabled }: MarketsTabProps) {
  const { data: holdings = [] } = usePortfolioHoldings({ enabled: !!enabled })
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const router = useRouter()
  if (!enabled) return null
  return (
    <div className="space-y-4">
      <TickerSearchBox onSelect={setSelectedTicker} />
      {selectedTicker && (
        <div className="space-y-3">
          <TickerChartPanel ticker={selectedTicker} />
          <Button
            type="button"
            onClick={() => router.push(`/investments?add=${encodeURIComponent(selectedTicker)}`)}
          >
            Add holding for {selectedTicker}
          </Button>
        </div>
      )}
      <MarketDiscoveryCard />
      <TopMovers holdings={holdings} />
    </div>
  )
}
