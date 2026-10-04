'use client'

import React, { useState } from 'react'
import { TickerSearchBox } from './TickerSearchBox'
import { TickerChartPanel } from './TickerChartPanel'
import { MarketDiscoveryCard } from './MarketDiscoveryCard'
import type { HoldingPrefill } from '@/lib/store/holdingDraft.store'
import type { TickerSearchResult } from '@/types/investments'

export interface MarketsTabProps {
  onBuy: (prefill: HoldingPrefill) => void
}

export function MarketsTab({ onBuy }: MarketsTabProps) {
  const [selectedTicker, setSelectedTicker] = useState<string>('GGAL')
  const [selectedName, setSelectedName] = useState<string>('')

  const handleSelect = (ticker: string, item?: TickerSearchResult) => {
    setSelectedTicker(ticker)
    setSelectedName(item?.name ?? '')
  }

  const handleBuy = (ticker: string, price?: number | null, currency?: string) => {
    onBuy({
      ticker,
      name: selectedName || undefined,
      price: price ?? undefined,
      currency: currency === 'USD' ? 'USD' : 'ARS',
    })
  }

  return (
    <div className="flex flex-col gap-4 frame:h-full frame:min-h-0">
      <TickerSearchBox onSelect={handleSelect} />

      <div data-testid="markets-grid" className="grid grid-cols-1 gap-4 @min-[852px]/page:grid-cols-[2fr_1fr] frame:min-h-0 frame:flex-1">
        {selectedTicker && (
          <TickerChartPanel
            ticker={selectedTicker}
            name={selectedName}
            onBuy={handleBuy}
            className="frame:min-h-0"
          />
        )}
        <MarketDiscoveryCard onSelectTicker={handleSelect} className="frame:min-h-0" />
      </div>
    </div>
  )
}
