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
    <div className="space-y-6">
      <TickerSearchBox onSelect={handleSelect} />

      {selectedTicker && (
        <TickerChartPanel
          ticker={selectedTicker}
          name={selectedName}
          onBuy={handleOpenBuy}
        />
      )}

      <MarketDiscoveryCard onSelectTicker={handleSelect} />

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
