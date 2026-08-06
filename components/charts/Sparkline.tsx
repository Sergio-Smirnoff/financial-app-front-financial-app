import React from 'react'
import { line, area, curveMonotoneX } from 'd3-shape'
import { scaleUtc, scaleLinear } from 'd3-scale'
import { ChartFrame } from './primitives/ChartFrame'
import { SeriesPoint } from './primitives/useChartScales'

export interface SparklineProps {
  series: SeriesPoint[]
  ariaLabel: string
  height?: number
  width?: number
  className?: string
  isPositive?: boolean
}

export function Sparkline({
  series,
  ariaLabel,
  height = 40,
  width = 120,
  className = '',
  isPositive
}: SparklineProps) {
  if (!series || series.length === 0) {
    return (
      <ChartFrame width={width} height={height} ariaLabel={ariaLabel} className={className}>
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="currentColor" strokeOpacity={0.2} />
      </ChartFrame>
    )
  }

  const padding = 4

  const dates = series.map((s) => (s.date instanceof Date ? s.date : new Date(s.date)))
  const values = series.map((s) => s.value)

  const minDate = dates[0]
  const maxDate = dates[dates.length - 1]
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)

  const x = scaleUtc()
    .domain([minDate, maxDate])
    .range([padding, width - padding])

  const y = scaleLinear()
    .domain([minVal === maxVal ? minVal - 1 : minVal, minVal === maxVal ? maxVal + 1 : maxVal])
    .range([height - padding, padding])

  const lineGenerator = line<SeriesPoint>()
    .x((d) => x(d.date instanceof Date ? d.date : new Date(d.date)))
    .y((d) => y(d.value))
    .curve(curveMonotoneX)

  const areaGenerator = area<SeriesPoint>()
    .x((d) => x(d.date instanceof Date ? d.date : new Date(d.date)))
    .y0(height - padding)
    .y1((d) => y(d.value))
    .curve(curveMonotoneX)

  const linePath = lineGenerator(series) || ''
  const areaPath = areaGenerator(series) || ''

  const firstVal = series[0]?.value ?? 0
  const lastVal = series[series.length - 1]?.value ?? 0
  const computedPositive = isPositive !== undefined ? isPositive : lastVal >= firstVal

  const strokeColorClass = computedPositive ? 'stroke-emerald-500' : 'stroke-rose-500'
  const fillColorClass = computedPositive ? 'fill-emerald-500/10' : 'fill-rose-500/10'

  const dataTable = series.map((s) => ({
    label: s.date instanceof Date ? s.date.toISOString().split('T')[0] : String(s.date),
    value: s.value
  }))

  return (
    <ChartFrame width={width} height={height} ariaLabel={ariaLabel} dataTable={dataTable} className={className}>
      <path d={areaPath} className={fillColorClass} />
      <path d={linePath} fill="none" strokeWidth={1.5} className={strokeColorClass} />
    </ChartFrame>
  )
}
