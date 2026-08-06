import React from 'react'
import { scaleBand, scaleLinear } from 'd3-scale'
import { ChartFrame } from './primitives/ChartFrame'

export interface HorizonMonth {
  month: string
  amount: number
}

export interface HorizonBarsProps {
  months: HorizonMonth[]
  currency?: string
  ariaLabel: string
  height?: number
  width?: number
  className?: string
}

export function HorizonBars({
  months,
  currency = 'ARS',
  ariaLabel,
  height = 240,
  width = 640,
  className = ''
}: HorizonBarsProps) {
  const paddingX = 32
  const paddingY = 32

  const currencySymbol = currency === 'USD' ? 'US$' : '$'

  const maxVal = Math.max(...months.map((m) => m.amount), 100)

  const xScale = scaleBand<string>()
    .domain(months.map((m) => m.month))
    .range([paddingX, width - paddingX])
    .padding(0.2)

  const yScale = scaleLinear()
    .domain([0, maxVal])
    .range([height - paddingY, paddingY])
    .nice()

  const ticksY = yScale.ticks(5)

  // Map amount rank to ramp step so tone and data-step descend with amount
  const sortedAmounts = [...months].map((m) => m.amount).sort((a, b) => a - b)

  const getStep = (amt: number) => {
    const rank = sortedAmounts.indexOf(amt) + 1
    return rank * 100
  }

  const dataTable = months.map((m) => ({
    label: m.month,
    value: m.amount
  }))

  return (
    <ChartFrame width={width} height={height} ariaLabel={ariaLabel} dataTable={dataTable} className={className}>
      {/* Y Gridlines & Ticks */}
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

      {/* Horizon Bars */}
      {months.map((m) => {
        const barX = xScale(m.month) ?? 0
        const barY = yScale(m.amount)
        const barH = Math.max(0, height - paddingY - barY)
        const barW = xScale.bandwidth()
        const step = getStep(m.amount)

        // Calculate opacity / tone based on step ratio
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
                y={height - paddingY + 16}
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
    </ChartFrame>
  )
}
