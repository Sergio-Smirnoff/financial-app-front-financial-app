'use client'

import React, { useState } from 'react'
import { TickerSearchBox } from './TickerSearchBox'
import { TickerChartPanel } from './TickerChartPanel'
import { MarketDiscoveryCard } from './MarketDiscoveryCard'
import { RecordHoldingDialog } from './RecordHoldingDialog'
import type { TickerSearchResult } from '@/types/investments'

export interface MarketsTabProps {
  initialTicker?: string
}

export function MarketsTab({ initialTicker }: MarketsTabProps) {
  const [selectedTicker, setSelectedTicker] = useState<string>(initialTicker || 'GGAL')
  const [selectedName, setSelectedName] = useState<string>('')
  const [buyDialogOpen, setBuyDialogOpen] = useState(false)
  const [buyPrice, setBuyPrice] = useState<number | undefined>(undefined)
  const [buyCurrency, setBuyCurrency] = useState<'ARS' | 'USD'>('ARS')

  const handleSelect = (ticker: string, item?: TickerSearchResult) => {
    setSelectedTicker(ticker)
    if (item?.name) {
      setSelectedName(item.name)
    }
  }

  const handleOpenBuy = (ticker: string, price?: number | null, currency?: string) => {
    setSelectedTicker(ticker)
    setBuyPrice(price ?? undefined)
    setBuyCurrency((currency as 'ARS' | 'USD') ?? 'ARS')
    setBuyDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 frame:h-full frame:min-h-0">
      <TickerSearchBox onSelect={handleSelect} />

      <div data-testid="markets-grid" className="grid grid-cols-1 gap-4 @min-[852px]/page:grid-cols-[2fr_1fr] frame:min-h-0 frame:flex-1">
        {selectedTicker && (
          <TickerChartPanel
            ticker={selectedTicker}
            name={selectedName}
            onBuy={handleOpenBuy}
            className="frame:min-h-0"
          />
        )}
        <MarketDiscoveryCard onSelectTicker={handleSelect} className="frame:min-h-0" />
      </div>

      <RecordHoldingDialog
        open={buyDialogOpen}
        onOpenChange={setBuyDialogOpen}
        initialTicker={selectedTicker}
        initialName={selectedName}
        initialPrice={buyPrice}
        initialCurrency={buyCurrency}
      />
    </div>
  )
}
