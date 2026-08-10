'use client'

import React from 'react'
import Link from 'next/link'
import { AreaChart } from '@/components/charts/AreaChart'
import { Money } from '@/components/ui-kit/money/Money'
import { DeltaBadge } from '@/components/ui-kit/money/DeltaBadge'
import { KpiStrip, KpiTile } from '@/components/ui-kit/layout/KpiStrip'
import type { MoneyView } from '@/lib/format'

export interface PositionDetailData {
  id: number
  ticker: string
  name: string
  assetType: string
  quantity: number
  avgPrice: MoneyView
  currentPrice: MoneyView
  totalValue: MoneyView
  pnl: { amount: MoneyView; pct: number }
  prices: { date: string; value: number }[]
}

export interface PositionDetailProps {
  holding: PositionDetailData
}

export function PositionDetail({ holding }: PositionDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/investments" className="text-xs text-primary hover:underline font-medium mb-1 inline-block">
            ← Volver a Inversiones
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-mono font-bold tracking-tight">{holding.ticker}</h1>
            <span className="text-sm text-muted-foreground">{holding.name}</span>
          </div>
        </div>
        <DeltaBadge pct={holding.pnl.pct} absolute={holding.pnl.amount} />
      </div>

      <KpiStrip>
        <KpiTile label="Cantidad" value={String(holding.quantity)} />
        <KpiTile label="Precio promedio" value={<Money value={holding.avgPrice} />} />
        <KpiTile label="Precio actual" value={<Money value={holding.currentPrice} />} />
        <KpiTile label="Valor total" value={<Money value={holding.totalValue} />} />
      </KpiStrip>

      <div className="elev-sm rounded-xl border bg-card p-6 space-y-4">
        <h3 className="section-head">Histórico de Precios</h3>
        <AreaChart
          data={holding.prices}
          currency={holding.currentPrice.currency}
          ariaLabel={`Histórico de precios de ${holding.ticker}`}
        />
      </div>
    </div>
  )
}
