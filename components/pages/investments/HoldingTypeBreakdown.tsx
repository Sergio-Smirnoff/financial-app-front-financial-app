'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { usePortfolioHoldings } from '@/lib/hooks/useInvestments'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency } from '@/lib/utils/currency'
import type { AssetType, HoldingWithPrice } from '@/types/investments'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

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

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: SliceEntry }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-semibold">{item.name} ({item.ticker})</p>
      <p className="text-muted-foreground">
        Value: {formatCurrency(item.value, item.currency)}
      </p>
      {item.currentPrice != null && (
        <p className="text-muted-foreground">
          Price: {formatCurrency(item.currentPrice, item.currency)}
        </p>
      )}
      <p className="font-medium">{item.percentage.toFixed(1)}%</p>
    </div>
  )
}

import { Surface } from '@/components/shared/Surface'

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
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={slices}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
              >
                {slices.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(_, entry) => {
                  const item = entry.payload as unknown as SliceEntry
                  return `${item.name} (${item.percentage.toFixed(1)}%)`
                }}
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Surface>
  )
}
