import React from 'react'
import { ScaleTime, ScaleLinear } from 'd3-scale'

export interface AxisProps {
  xScale: ScaleTime<number, number>
  yScale: ScaleLinear<number, number>
  ticksX: Date[]
  ticksY: number[]
  width: number
  height: number
  paddingX?: number
  paddingY?: number
  formatX?: (date: Date) => string
  formatY?: (val: number) => string
}

export function Axis({
  xScale,
  yScale,
  ticksX,
  ticksY,
  width,
  height,
  paddingX = 32,
  paddingY = 32,
  formatX,
  formatY
}: AxisProps) {
  const defaultFormatX = (d: Date) => {
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = String(d.getFullYear()).slice(-2)
    return `${month}/${year}`
  }

  const defaultFormatY = (v: number) => {
    if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
    if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}k`
    return String(v)
  }

  const fx = formatX || defaultFormatX
  const fy = formatY || defaultFormatY

  const yRange = yScale.range()
  const bottomY = Math.max(...yRange)

  return (
    <g className="chart-axis opacity-70 text-[10px] font-sans">
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
              {fy(tick)}
            </text>
          </g>
        )
      })}

      {/* X Ticks */}
      {ticksX.map((tick, idx) => {
        const xPos = xScale(tick)
        return (
          <g key={`x-${idx}`} data-testid="tick-x">
            <text
              x={xPos}
              y={bottomY + 16}
              textAnchor="middle"
              fill="currentColor"
              className="fill-muted-foreground font-mono text-[10px]"
            >
              {fx(tick)}
            </text>
          </g>
        )
      })}
    </g>
  )
}
