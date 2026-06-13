'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { formatCurrency } from '@/lib/utils/currency'
import type { PricePoint } from '@/types/investments'

interface Props {
  series: PricePoint[]
  currency: string
  strokeColor?: string
  showAxes?: boolean
  height?: number
}

export function PriceChart({ series, currency, strokeColor = '#34d399', showAxes = false, height = 220 }: Props) {
  if (series.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No price data.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={series}>
        {showAxes && (
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        )}
        <XAxis
          dataKey="date"
          hide={!showAxes}
          tick={showAxes ? { fontSize: 10 } : undefined}
          tickLine={showAxes ? false : undefined}
        />
        <YAxis
          domain={['auto', 'auto']}
          hide={!showAxes}
          tick={showAxes ? { fontSize: 10 } : undefined}
          tickLine={showAxes ? false : undefined}
          width={showAxes ? 65 : undefined}
          tickFormatter={showAxes ? (v) => v.toLocaleString() : undefined}
          scale="linear"
        />
        <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
        <Line
          type="linear"
          dataKey="price"
          stroke={strokeColor}
          strokeWidth={2}
          dot={false}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
