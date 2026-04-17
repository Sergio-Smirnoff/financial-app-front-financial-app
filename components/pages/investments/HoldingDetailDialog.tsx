'use client'

import { useState } from 'react'
import { format, subWeeks, subMonths } from 'date-fns'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { usePriceHistory } from '@/lib/hooks/useInvestments'
import { formatCurrency } from '@/lib/utils/currency'
import type { HoldingWithPrice } from '@/types/investments'

type Range = '1W' | '1M' | '3M' | 'ALL'
const RANGES: Range[] = ['1W', '1M', '3M', 'ALL']

function getRangeDates(range: Range): { from?: string; to?: string } {
  const now = new Date()
  if (range === 'ALL') return {}
  const from =
    range === '1W'
      ? subWeeks(now, 1)
      : range === '1M'
        ? subMonths(now, 1)
        : subMonths(now, 3)
  return { from: from.toISOString(), to: now.toISOString() }
}

function ThresholdStatus({ holding }: { holding: HoldingWithPrice }) {
  const pl = holding.plPercent ?? 0
  const gainPct = holding.notifyGainThresholdPct
  const lossPct = holding.notifyLossThresholdPct
  if (!gainPct && !lossPct) return null

  const gainReached = gainPct != null && pl >= gainPct
  const lossReached = lossPct != null && pl <= -lossPct

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Alert Thresholds
      </p>
      {gainPct != null && (
        <div className="flex items-center justify-between text-sm">
          <span>Gain threshold: {gainPct}%</span>
          {gainReached ? (
            <span className="text-green-500 font-medium">✓ Reached</span>
          ) : (
            <span className="text-muted-foreground">Not triggered</span>
          )}
        </div>
      )}
      {lossPct != null && (
        <div className="flex items-center justify-between text-sm">
          <span>Loss threshold: {lossPct}%</span>
          {lossReached ? (
            <span className="text-red-500 font-medium">✓ Reached</span>
          ) : (
            <span className="text-muted-foreground">Not triggered</span>
          )}
        </div>
      )}
      {holding.lastGainNotifiedAt && (
        <p className="text-xs text-muted-foreground">
          Last gain alert:{' '}
          {format(new Date(holding.lastGainNotifiedAt), 'MMM d, yyyy HH:mm')}
        </p>
      )}
      {holding.lastLossNotifiedAt && (
        <p className="text-xs text-muted-foreground">
          Last loss alert:{' '}
          {format(new Date(holding.lastLossNotifiedAt), 'MMM d, yyyy HH:mm')}
        </p>
      )}
    </div>
  )
}

interface Props {
  holding: HoldingWithPrice | null
  open: boolean
  onClose: () => void
}

export function HoldingDetailDialog({ holding, open, onClose }: Props) {
  const [range, setRange] = useState<Range>('1M')
  const { from, to } = getRangeDates(range)

  const { data: history = [], isLoading } = usePriceHistory(
    holding?.ticker ?? '',
    from,
    to,
  )

  if (!holding) return null

  const chartData = history.map((p) => ({
    date: format(new Date(p.pricedAt), 'MMM d HH:mm'),
    price: Number(p.lastPrice),
  }))

  const rangeChange =
    history.length >= 2
      ? ((Number(history[history.length - 1].lastPrice) -
          Number(history[0].lastPrice)) /
          Number(history[0].lastPrice)) *
        100
      : null

  const plColor = (holding.plPercent ?? 0) >= 0 ? '#22c55e' : '#ef4444'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span>{holding.ticker}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {holding.name}
            </span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded font-normal">
              {holding.assetType}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Current Price</p>
            <p className="font-semibold">
              {formatCurrency(holding.currentPrice ?? 0, holding.currency)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">P&L (all time)</p>
            <p className="font-semibold" style={{ color: plColor }}>
              {(holding.plPercent ?? 0) >= 0 ? '+' : ''}
              {holding.plPercent?.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-0.5">Range Change</p>
            <p
              className="font-semibold"
              style={{
                color:
                  rangeChange != null
                    ? rangeChange >= 0
                      ? '#22c55e'
                      : '#ef4444'
                    : undefined,
              }}
            >
              {rangeChange != null
                ? `${rangeChange >= 0 ? '+' : ''}${rangeChange.toFixed(2)}%`
                : '—'}
            </p>
          </div>
        </div>

        {/* Range selector */}
        <div className="flex gap-2">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                range === r
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:bg-muted'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-52">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              Loading…
            </div>
          ) : chartData.length < 2 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground text-center px-4">
              Not enough data for this range yet. History builds up each time
              prices refresh (weekdays 10–17 ARS time).
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  width={65}
                  tickFormatter={(v) => v.toLocaleString()}
                />
                <Tooltip
                  formatter={(v) => [
                    formatCurrency(Number(v ?? 0), holding.currency),
                    'Price',
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={plColor}
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Threshold status */}
        <ThresholdStatus holding={holding} />
      </DialogContent>
    </Dialog>
  )
}
