import React from 'react'
import { line, area, curveMonotoneX } from 'd3-shape'
import { scaleUtc, scaleLinear } from 'd3-scale'
import { ChartFrame, type ChartSize } from './primitives/ChartFrame'
import { SeriesPoint } from './primitives/useChartScales'

export interface SparklineProps {
  series: SeriesPoint[]
  ariaLabel: string
  minHeight?: number
  className?: string
  isPositive?: boolean
}

const PADDING = 4

export function Sparkline({ series, ariaLabel, minHeight = 40, className = '', isPositive }: SparklineProps) {
  const hasData = series && series.length > 0
  const dataTable = hasData
    ? series.map((s) => ({
        label: s.date instanceof Date ? s.date.toISOString().split('T')[0] : String(s.date),
        value: s.value
      }))
    : undefined

  return (
    <ChartFrame ariaLabel={ariaLabel} dataTable={dataTable} minHeight={minHeight} className={className}>
      {(size) =>
        hasData ? (
          <SparklinePlot size={size} series={series} isPositive={isPositive} />
        ) : (
          <line x1={0} y1={size.height / 2} x2={size.width} y2={size.height / 2} stroke="currentColor" strokeOpacity={0.2} />
        )
      }
    </ChartFrame>
  )
}

interface SparklinePlotProps {
  size: ChartSize
  series: SeriesPoint[]
  isPositive?: boolean
}

function SparklinePlot({ size: { width, height }, series, isPositive }: SparklinePlotProps) {
  const dates = series.map((s) => (s.date instanceof Date ? s.date : new Date(s.date)))
  const values = series.map((s) => s.value)

  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)

  const x = scaleUtc()
    .domain([dates[0], dates[dates.length - 1]])
    .range([PADDING, width - PADDING])

  const y = scaleLinear()
    .domain([minVal === maxVal ? minVal - 1 : minVal, minVal === maxVal ? maxVal + 1 : maxVal])
    .range([height - PADDING, PADDING])

  const lineGenerator = line<SeriesPoint>()
    .x((d) => x(d.date instanceof Date ? d.date : new Date(d.date)))
    .y((d) => y(d.value))
    .curve(curveMonotoneX)

  const areaGenerator = area<SeriesPoint>()
    .x((d) => x(d.date instanceof Date ? d.date : new Date(d.date)))
    .y0(height - PADDING)
    .y1((d) => y(d.value))
    .curve(curveMonotoneX)

  const firstVal = series[0]?.value ?? 0
  const lastVal = series[series.length - 1]?.value ?? 0
  const computedPositive = isPositive !== undefined ? isPositive : lastVal >= firstVal

  return (
    <>
      <path d={areaGenerator(series) || ''} className={computedPositive ? 'fill-emerald-500/10' : 'fill-rose-500/10'} />
      <path
        d={lineGenerator(series) || ''}
        fill="none"
        strokeWidth={1.5}
        className={computedPositive ? 'stroke-emerald-500' : 'stroke-rose-500'}
      />
    </>
  )
}
