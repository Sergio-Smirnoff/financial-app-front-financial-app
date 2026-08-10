'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { PositionDetail } from '@/components/pages/investments/PositionDetail'

export default function HoldingDetailPage() {
  const { id } = useParams<{ id: string }>()

  const dummyHolding = {
    id: parseInt(id || '42', 10),
    ticker: 'YPFD',
    name: 'YPF S.A.',
    assetType: 'Acción',
    quantity: 100,
    avgPrice: { amount: '12000', currency: 'ARS', secondary: null },
    currentPrice: { amount: '15000', currency: 'ARS', secondary: null },
    totalValue: { amount: '1500000', currency: 'ARS', secondary: null },
    pnl: { amount: { amount: '300000', currency: 'ARS', secondary: null }, pct: 25 },
    prices: [
      { date: '2026-08-01', value: 12000 },
      { date: '2026-08-02', value: 13500 },
      { date: '2026-08-03', value: 15000 },
    ],
  }

  return (
    <main className="flex-1 overflow-auto p-6">
      <PositionDetail holding={dummyHolding} />
    </main>
  )
}
