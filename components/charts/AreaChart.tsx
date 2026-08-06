import React, { useState, useId } from 'react'
import { area, line, curveMonotoneX } from 'd3-shape'
import { ChartFrame } from './primitives/ChartFrame'
import { Axis } from './primitives/Axis'
import { HoverMarker } from './primitives/HoverMarker'
import { useChartScales, SeriesPoint } from './primitives/useChartScales'

export interface AreaChartProps {
  series: SeriesPoint[]
  comparison?: SeriesPoint[]
  currency?: string
  ariaLabel: string
  height?: number
  width?: number
  className?: string
}

export function AreaChart({
  series,
  comparison,
  currency = 'ARS',
  ariaLabel,
  height = 240,
  width = 640,
  className = ''
}: AreaChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const gradientId = useId()

  const combinedPoints = comparison && comparison.length > 0 ? [...series, ...comparison] : series

  const paddingX = 32
  const paddingY = 32

  const { x, y, ticksX, ticksY } = useChartScales({
    points: combinedPoints,
    width,
    height,
    paddingX,
    paddingY
  })

  if (!series || series.length === 0) {
    return (
      <ChartFrame width={width} height={height} ariaLabel={ariaLabel} className={className}>
        <text x={width / 2} y={height / 2} textAnchor="middle" fill="currentColor" className="text-sm fill-muted-foreground">
          Sin datos suficientes
        </text>
      </ChartFrame>
    )
  }

  const minY = y.domain()[0]

  const areaGenerator = area<SeriesPoint>()
    .x((d) => x(d.date instanceof Date ? d.date : new Date(d.date)))
    .y0(y(minY))
    .y1((d) => y(d.value))
    .curve(curveMonotoneX)

  const lineGenerator = line<SeriesPoint>()
    .x((d) => x(d.date instanceof Date ? d.date : new Date(d.date)))
    .y((d) => y(d.value))
    .curve(curveMonotoneX)

  const areaPath = areaGenerator(series) || ''
  const linePath = lineGenerator(series) || ''
  const comparisonLinePath = comparison ? lineGenerator(comparison) || '' : ''

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const svgMouseX = (mouseX / rect.width) * width

    let closestIdx = 0
    let minDistance = Infinity

    series.forEach((pt, i) => {
      const ptX = x(pt.date instanceof Date ? pt.date : new Date(pt.date))
      const dist = Math.abs(ptX - svgMouseX)
      if (dist < minDistance) {
        minDistance = dist
        closestIdx = i
      }
    })

    setHoverIndex(closestIdx)
  }

  const activeIdx = hoverIndex !== null ? hoverIndex : series.length - 1
  const activePoint = series[activeIdx]

  // Delta calculation relative to initial point (or zero)
  const baseValue = series[0]?.value ?? 0
  const currentValue = activePoint?.value ?? 0
  const deltaValue = currentValue - baseValue
  const deltaPct = baseValue !== 0 ? (deltaValue / baseValue) * 100 : 0
  const isPositiveDelta = deltaValue >= 0

  const activeDate = activePoint?.date instanceof Date ? activePoint.date : new Date(activePoint.date)
  const month = String(activeDate.getDate()).padStart(2, '0') // or String(activeDate.getMonth() + 1).padStart(2, '0')
  const monthOfYear = String(activeDate.getMonth() + 1).padStart(2, '0')
  const dateText = `${month}/${monthOfYear}`

  const currencySymbol = currency === 'USD' ? 'US$' : '$'
  const valueText = `${currencySymbol} ${currentValue.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  const deltaText = `${isPositiveDelta ? '+' : '−'}${Math.abs(deltaPct).toFixed(1)}%`

  const dataTable = series.map((s) => ({
    label: s.date instanceof Date ? s.date.toISOString().split('T')[0] : String(s.date),
    value: s.value
  }))

  return (
    <ChartFrame width={width} height={height} ariaLabel={ariaLabel} dataTable={dataTable} className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.25} className="text-primary" />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0.02} className="text-primary" />
        </linearGradient>
      </defs>

      <Axis
        xScale={x}
        yScale={y}
        ticksX={ticksX}
        ticksY={ticksY}
        width={width}
        height={height}
        paddingX={paddingX}
        paddingY={paddingY}
        formatY={(val) => `${currencySymbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
      />

      {/* Main Area */}
      <path d={areaPath} fill={`url(#${gradientId})`} />

      {/* Comparison Series Line if present */}
      {comparison && (
        <path
          data-role="comparison"
          d={comparisonLinePath}
          fill="none"
          stroke="currentColor"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          className="stroke-muted-foreground/70"
        />
      )}

      {/* Main Series Line */}
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="stroke-primary"
      />

      {/* Vertex circles (1 per series point) */}
      {series.map((p, i) => {
        const cx = x(p.date instanceof Date ? p.date : new Date(p.date))
        const cy = y(p.value)
        return (
          <circle
            key={i}
            data-role="vertex"
            cx={cx}
            cy={cy}
            r={3}
            className="fill-primary stroke-background"
            strokeWidth={1.5}
          />
        )
      })}

      {/* Interactive hover overlay area */}
      <rect
        data-testid="hover-area"
        x={paddingX}
        y={0}
        width={width - 2 * paddingX}
        height={height}
        fill="transparent"
        className="cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      />

      {/* Active hover marker */}
      {activePoint && (
        <HoverMarker
          x={x(activeDate)}
          y={y(activePoint.value)}
          height={height}
          paddingY={paddingY}
          dateText={dateText}
          valueText={valueText}
          deltaText={deltaText}
          isPositiveDelta={isPositiveDelta}
        />
      )}
    </ChartFrame>
  )
}
