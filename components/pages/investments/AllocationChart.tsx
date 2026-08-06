'use client'

import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/format'
import type { AllocationBreakdown } from '@/types/investments'
import { Surface } from '@/components/shared/Surface'

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

interface TooltipEntry {
  name: string
  value: number
  percentage: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ payload: TooltipEntry }>
}

function CustomTooltip({ active, payload, currency }: CustomTooltipProps & { currency: string }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-foreground">{item.name}</p>
      <p className="text-muted-foreground">{formatCurrency(item.value, currency)}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
        {item.percentage.toFixed(1)}%
      </p>
    </div>
  )
}

export function AllocationChart({ breakdown, currency }: AllocationChartProps) {
  const data = breakdown.map((b) => ({
    name: LABELS[b.assetType] ?? b.assetType,
    value: b.totalValue,
    percentage: b.percentage,
  }))

  return (
    <Surface className="bg-gradient-to-b from-muted/40 to-card">
      <CardHeader className="pb-1">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Allocation · {currency}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No data</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  strokeWidth={0}
                  dataKey="value"
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip currency={currency} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 mt-2">
              {data.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full shrink-0"
                      style={{ background: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-foreground font-medium">{item.name}</span>
                  </div>
                  <span className="text-muted-foreground tabular-nums">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Surface>
  )
}
