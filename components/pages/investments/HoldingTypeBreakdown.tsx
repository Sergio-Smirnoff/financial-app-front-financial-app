'use client'

import { useState } from 'react'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CompositionBar } from '@/components/charts/CompositionBar'
import { usePortfolioHoldings } from '@/lib/hooks/useInvestments'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency } from '@/lib/format'
import type { AssetType, HoldingWithPrice } from '@/types/investments'
import { Surface } from '@/components/shared/Surface'

const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  STOCK: 'Stocks',
  BOND: 'Bonds',
  CEDEAR: 'CEDEARs',
  FCI: 'FCI',
}

interface SliceEntry {
  name: string
  ticker: string
  value: number
  percentage: number
  currentPrice: number | null
  currency: string
}

function buildSlices(holdings: HoldingWithPrice[]): SliceEntry[] {
  const withValue = holdings.filter((h) => h.currentValue != null && h.currentValue > 0)
  const total = withValue.reduce((sum, h) => sum + (h.currentValue ?? 0), 0)
  if (total === 0) return []
  return withValue.map((h) => ({
    name: h.name,
    ticker: h.ticker,
    value: h.currentValue!,
    percentage: (h.currentValue! / total) * 100,
    currentPrice: h.currentPrice,
    currency: h.currency,
  }))
}

export function HoldingTypeBreakdown() {
  const { data: holdings, isLoading } = usePortfolioHoldings()
  const [activeType, setActiveType] = useState<AssetType | null>(null)

  if (isLoading) return <LoadingSpinner />
  if (!holdings?.length) return null

  const grouped = holdings.reduce<Partial<Record<AssetType, HoldingWithPrice[]>>>((acc, h) => {
    if (!acc[h.assetType]) acc[h.assetType] = []
    acc[h.assetType]!.push(h)
    return acc
  }, {})

  const types = Object.keys(grouped) as AssetType[]
  if (types.length === 0) return null

  const currentType = activeType ?? types[0]
  const slices = buildSlices(grouped[currentType] ?? [])

  const compSlices = slices.map((s) => ({
    label: `${s.name} (${s.ticker})`,
    amount: formatCurrency(s.value, s.currency),
    pct: s.percentage,
  }))

  return (
    <Surface>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Holdings by Type</CardTitle>
        <div className="flex gap-2 flex-wrap mt-1">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                currentType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {ASSET_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {slices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No price data available</p>
        ) : (
          <CompositionBar slices={compSlices} />
        )}
      </CardContent>
    </Surface>
  )
}
