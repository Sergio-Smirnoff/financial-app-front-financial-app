import React from 'react'
import { scaleBand, scaleLinear } from 'd3-scale'
import { ChartFrame } from './primitives/ChartFrame'

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
  height?: number
  width?: number
  className?: string
}

export function BarPairChart({
  months,
  currency = 'ARS',
  highlightMonth,
  ariaLabel,
  height = 240,
  width = 640,
  className = ''
}: BarPairChartProps) {
  const paddingX = 32
  const paddingY = 32

  const currencySymbol = currency === 'USD' ? 'US$' : '$'

  const maxVal = Math.max(...months.map((m) => Math.max(m.income, m.expense)), 100)

  const xScale = scaleBand<string>()
    .domain(months.map((m) => m.month))
    .range([paddingX, width - paddingX])
    .paddingInner(0.25)
    .paddingOuter(0.1)

  const innerScale = scaleBand<string>()
    .domain(['income', 'expense'])
    .range([0, xScale.bandwidth()])
    .padding(0.1)

  const yScale = scaleLinear()
    .domain([0, maxVal])
    .range([height - paddingY, paddingY])
    .nice()

  const ticksY = yScale.ticks(5)

  const dataTable = months.flatMap((m) => [
    { label: `${m.month} (Ingreso)`, value: m.income },
    { label: `${m.month} (Egreso)`, value: m.expense }
  ])

  return (
    <ChartFrame width={width} height={height} ariaLabel={ariaLabel} dataTable={dataTable} className={className}>
      {/* Y Gridlines and Ticks */}
      {ticksY.map((tick, idx) => {
        const yPos = yScale(tick)
        return (
          <g key={`y-${idx}`} data-testid="tick-y">
            <line
              x1={paddingX}
              y1={yPos}
              x2={width - paddingX}
              y2={yPos}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeDasharray="2 2"
            />
            <text
              x={paddingX - 6}
              y={yPos + 3}
              textAnchor="end"
              fill="currentColor"
              className="fill-muted-foreground font-mono text-[10px]"
            >
              {currencySymbol}{tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : tick}
            </text>
          </g>
        )
      })}

      {/* Month Groups & Bars */}
      {months.map((m) => {
        const groupX = xScale(m.month) ?? 0
        const isCurrent = m.month === highlightMonth

        const incX = groupX + (innerScale('income') ?? 0)
        const incY = yScale(m.income)
        const incH = Math.max(0, height - paddingY - incY)

        const expX = groupX + (innerScale('expense') ?? 0)
        const expY = yScale(m.expense)
        const expH = Math.max(0, height - paddingY - expY)

        const barW = innerScale.bandwidth()

        return (
          <g key={m.month} data-testid={`bar-group-${m.month}`} data-current={isCurrent ? 'true' : 'false'}>
            {/* Income Bar */}
            <rect
              data-testid="bar-income"
              x={incX}
              y={incY}
              width={barW}
              height={incH}
              rx={2}
              className={isCurrent ? 'fill-emerald-500 font-bold' : 'fill-emerald-600/80 dark:fill-emerald-500/80'}
            />

            {/* Expense Bar */}
            <rect
              data-testid="bar-expense"
              x={expX}
              y={expY}
              width={barW}
              height={expH}
              rx={2}
              className="fill-rose-500/80 dark:fill-rose-400/80"
            />

            {/* Month Label */}
            <g data-testid="tick-x">
              <text
                x={groupX + xScale.bandwidth() / 2}
                y={height - paddingY + 16}
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
    </ChartFrame>
  )
}
