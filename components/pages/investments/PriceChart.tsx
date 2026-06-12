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

export interface PricePoint {
  date: string
  price: number
}

interface Props {
  series: PricePoint[]
  currency: string
  strokeColor?: string
  showAxes?: boolean
}

export function PriceChart({ series, currency, strokeColor = '#34d399', showAxes = false }: Props) {
  if (series.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No price data.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
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
          type="monotone"
          dataKey="price"
          stroke={strokeColor}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
