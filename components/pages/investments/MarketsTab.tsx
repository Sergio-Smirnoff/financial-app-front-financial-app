'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MarketDiscoveryCard } from './MarketDiscoveryCard'
import { TickerSearchBox } from './TickerSearchBox'
import { TickerChartPanel } from './TickerChartPanel'
import { Button } from '@/components/ui/button'

interface MarketsTabProps {
  enabled?: boolean
}

export function MarketsTab({ enabled }: MarketsTabProps) {
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
    </div>
  )
}
