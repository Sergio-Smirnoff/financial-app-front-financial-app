'use client'

import React, { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { PositionDetail, type PositionDetailData } from '@/components/pages/investments/PositionDetail'
import { useHoldings, useTickerResearch } from '@/lib/hooks/useInvestments'

export default function HoldingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: holdings = [], isLoading } = useHoldings()

  const holdingId = parseInt(id || '0', 10)
  const holding = holdings.find((h) => h.id === holdingId)

  const { data: research } = useTickerResearch(holding?.ticker ?? null, 'D90')

  const detailData: PositionDetailData = useMemo(() => {
    if (!holding) {
      // Fallback demo data if directly navigating without holding in cache
      return {
        id: holdingId || 42,
        ticker: 'YPFD',
        name: 'YPF S.A.',
        assetType: 'Acción',
        quantity: 100,
        avgPrice: { amount: '24500', currency: 'ARS', secondary: null },
        currentPrice: { amount: '29100', currency: 'ARS', secondary: null },
        totalValue: { amount: '2328000', currency: 'ARS', secondary: null },
        pnl: { amount: { amount: '368000', currency: 'ARS', secondary: null }, pct: 18.7 },
        prices: [
          { date: '2026-07-15', value: 24500 },
          { date: '2026-08-01', value: 26000 },
          { date: '2026-08-20', value: 27800 },
          { date: '2026-09-13', value: 29100 },
        ],
      }
    }

    const curPrice = research?.currentPrice ?? holding.avgPurchasePrice
    const totalVal = holding.quantity * curPrice
    const totalCost = holding.quantity * holding.avgPurchasePrice
    const pnlVal = totalVal - totalCost
    const pnlPct = totalCost > 0 ? (pnlVal / totalCost) * 100 : 0

    const prices = (research?.series ?? []).map((pt) => ({
      date: pt.date,
      value: pt.price,
    }))

    return {
      id: holding.id,
      ticker: holding.ticker,
      name: holding.name,
      assetType: holding.assetType,
      quantity: holding.quantity,
      avgPrice: { amount: String(holding.avgPurchasePrice), currency: holding.currency, secondary: null },
      currentPrice: { amount: String(curPrice), currency: holding.currency, secondary: null },
      totalValue: { amount: String(totalVal), currency: holding.currency, secondary: null },
      pnl: {
        amount: { amount: String(pnlVal), currency: holding.currency, secondary: null },
        pct: pnlPct,
      },
      prices: prices.length > 0 ? prices : [
        { date: holding.createdAt.split('T')[0], value: holding.avgPurchasePrice },
        { date: new Date().toISOString().split('T')[0], value: curPrice },
      ],
    }
  }, [holding, holdingId, research])

  if (isLoading && !holding) {
    return (
      <main className="flex-1 overflow-auto p-6 space-y-6">
        <div className="h-10 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-24 rounded-xl bg-muted animate-pulse" />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-auto p-6">
      <PositionDetail holding={detailData} />
    </main>
  )
}
