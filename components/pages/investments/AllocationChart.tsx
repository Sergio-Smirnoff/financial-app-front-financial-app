'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils/currency'
import type { AllocationBreakdown } from '@/types/investments'

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

const LABELS: Record<string, string> = {
  STOCK: 'Stocks',
  BOND: 'Bonds',
  CEDEAR: 'CEDEARs',
  FCI: 'FCI',
}

interface AllocationChartProps {
  breakdown: AllocationBreakdown[]
  currency: string
}

export function AllocationChart({ breakdown, currency }: AllocationChartProps) {
  const data = breakdown.map((b) => ({
    name: LABELS[b.assetType] ?? b.assetType,
    value: b.totalValue,
    percentage: b.percentage,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Allocation ({currency})</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No data</p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), currency)}
                contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
              />
              <Legend
                formatter={(value, entry) => {
                  const item = data.find((d) => d.name === value)
                  return `${value} (${item?.percentage.toFixed(1)}%)`
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
