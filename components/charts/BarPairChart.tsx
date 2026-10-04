import React from 'react'
import { scaleBand, scaleLinear } from 'd3-scale'
import { plotRange, plotRangeDown } from './primitives/plotRange'
import { ChartFrame, type ChartSize } from './primitives/ChartFrame'
import { moneyText } from '@/components/ui-kit/money/Money'

export interface MonthPair {
  month: string
  income: number
  expense: number
}

export interface BarPairChartProps {
  months: MonthPair[]
  currency?: string
  highlightMonth?: string
  ariaLabel: string
  minHeight?: number
  className?: string
}

const PADDING_X = 32
const PADDING_Y = 32

export function BarPairChart({
  months,
  currency = 'ARS',
  highlightMonth,
  ariaLabel,
  minHeight = 200,
  className = ''
}: BarPairChartProps) {
  const dataTable = months.flatMap((m) => [
    { label: `${m.month} (Ingreso)`, value: m.income },
    { label: `${m.month} (Egreso)`, value: m.expense }
  ])

  return (
    <ChartFrame ariaLabel={ariaLabel} dataTable={dataTable} minHeight={minHeight} className={className}>
      {(size) => <BarPairPlot size={size} months={months} currency={currency} highlightMonth={highlightMonth} />}
    </ChartFrame>
  )
}

interface BarPairPlotProps {
  size: ChartSize
  months: MonthPair[]
  currency: string
  highlightMonth?: string
}

function BarPairPlot({ size: { width, height }, months, currency, highlightMonth }: BarPairPlotProps) {
  const maxVal = Math.max(...months.map((m) => Math.max(m.income, m.expense)), 100)

  const xScale = scaleBand<string>()
    .domain(months.map((m) => m.month))
    .range(plotRange(PADDING_X, width - PADDING_X))
    .paddingInner(0.25)
    .paddingOuter(0.1)

  const innerScale = scaleBand<string>()
    .domain(['income', 'expense'])
    .range([0, xScale.bandwidth()])
    .padding(0.1)

  const yScale = scaleLinear()
    .domain([0, maxVal])
    .range(plotRangeDown(PADDING_Y, height - PADDING_Y))
    .nice()

  const ticksY = yScale.ticks(5)

  return (
    <>
      {ticksY.map((tick, idx) => {
        const yPos = yScale(tick)
        return (
          <g key={`y-${idx}`} data-testid="tick-y">
            <line
              x1={PADDING_X}
              y1={yPos}
              x2={width - PADDING_X}
              y2={yPos}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeDasharray="2 2"
            />
            <text
              x={PADDING_X - 6}
              y={yPos + 3}
              textAnchor="end"
              fill="currentColor"
              className="fill-muted-foreground font-mono text-[10px]"
            >
              {moneyText({ value: { amount: String(tick), currency }, compact: true })}
            </text>
          </g>
        )
      })}

      {months.map((m) => {
        const groupX = xScale(m.month) ?? 0
        const isCurrent = m.month === highlightMonth

        const incX = groupX + (innerScale('income') ?? 0)
        const incY = yScale(m.income)
        const incH = Math.max(0, height - PADDING_Y - incY)

        const expX = groupX + (innerScale('expense') ?? 0)
        const expY = yScale(m.expense)
        const expH = Math.max(0, height - PADDING_Y - expY)

        const barW = innerScale.bandwidth()

        return (
          <g key={m.month} data-testid={`bar-group-${m.month}`} data-current={isCurrent ? 'true' : 'false'}>
            <rect
              data-testid="bar-income"
              x={incX}
              y={incY}
              width={barW}
              height={incH}
              rx={2}
              className={isCurrent ? 'fill-emerald-500 font-bold' : 'fill-emerald-600/80 dark:fill-emerald-500/80'}
            />
            <rect
              data-testid="bar-expense"
              x={expX}
              y={expY}
              width={barW}
              height={expH}
              rx={2}
              className="fill-rose-500/80 dark:fill-rose-400/80"
            />
            <g data-testid="tick-x">
              <text
                x={groupX + xScale.bandwidth() / 2}
                y={height - PADDING_Y + 16}
                textAnchor="middle"
                fill="currentColor"
                className={`font-mono text-[10px] ${isCurrent ? 'fill-foreground font-bold' : 'fill-muted-foreground'}`}
              >
                {m.month.split('-')[1]}
              </text>
            </g>
          </g>
        )
      })}
    </>
  )
}
