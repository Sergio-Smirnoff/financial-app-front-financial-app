import React from 'react'
import { scaleBand, scaleLinear } from 'd3-scale'
import { plotRange, plotRangeDown } from './primitives/plotRange'
import { ChartFrame, type ChartSize } from './primitives/ChartFrame'
import { formatCompactMoney } from '@/lib/format'

export interface HorizonMonth {
  month: string
  amount: number
}

export interface HorizonBarsProps {
  months: HorizonMonth[]
  currency?: string
  ariaLabel: string
  minHeight?: number
  className?: string
}

const PADDING_X = 32
const PADDING_Y = 32

export function HorizonBars({ months, currency = 'ARS', ariaLabel, minHeight = 160, className = '' }: HorizonBarsProps) {
  const hasData = months && months.length > 0
  const dataTable = hasData ? months.map((m) => ({ label: m.month, value: m.amount })) : undefined

  return (
    <ChartFrame ariaLabel={ariaLabel} dataTable={dataTable} minHeight={minHeight} className={className}>
      {(size) =>
        hasData ? (
          <HorizonPlot size={size} months={months} currency={currency} />
        ) : (
          <text x={size.width / 2} y={size.height / 2} textAnchor="middle" fill="currentColor" className="text-sm fill-muted-foreground">
            Sin datos suficientes
          </text>
        )
      }
    </ChartFrame>
  )
}

interface HorizonPlotProps {
  size: ChartSize
  months: HorizonMonth[]
  currency: string
}

function HorizonPlot({ size: { width, height }, months, currency }: HorizonPlotProps) {
  const maxVal = Math.max(...months.map((m) => m.amount), 100)

  const xScale = scaleBand<string>()
    .domain(months.map((m) => m.month))
    .range(plotRange(PADDING_X, width - PADDING_X))
    .padding(0.2)

  const yScale = scaleLinear()
    .domain([0, maxVal])
    .range(plotRangeDown(PADDING_Y, height - PADDING_Y))
    .nice()

  const ticksY = yScale.ticks(5)

  const sortedAmounts = [...months].map((m) => m.amount).sort((a, b) => a - b)
  const getStep = (amt: number) => (sortedAmounts.indexOf(amt) + 1) * 100

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
              {formatCompactMoney(tick, currency)}
            </text>
          </g>
        )
      })}

      {months.map((m) => {
        const barX = xScale(m.month) ?? 0
        const barY = yScale(m.amount)
        const barH = Math.max(0, height - PADDING_Y - barY)
        const barW = xScale.bandwidth()
        const step = getStep(m.amount)
        const opacity = 0.3 + (step / (months.length * 100)) * 0.7

        return (
          <g key={m.month}>
            <rect
              data-step={step}
              x={barX}
              y={barY}
              width={barW}
              height={barH}
              rx={3}
              fill="currentColor"
              fillOpacity={opacity}
              className="text-primary"
            />
            <g data-testid="tick-x">
              <text
                x={barX + barW / 2}
                y={height - PADDING_Y + 16}
                textAnchor="middle"
                fill="currentColor"
                className="fill-muted-foreground font-mono text-[10px]"
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
