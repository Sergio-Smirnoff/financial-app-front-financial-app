import React, { useState, useId, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { area, line, curveMonotoneX, curveLinear } from 'd3-shape'
import { ChartFrame, type ChartSize } from './primitives/ChartFrame'
import { Axis } from './primitives/Axis'
import { HoverMarker } from './primitives/HoverMarker'
import { useChartScales, SeriesPoint } from './primitives/useChartScales'
import { currencySymbol, formatCompactMoney, formatPercent } from '@/lib/format'

type CurveMode = 'linear' | 'monotone' | 'auto'

export interface AreaChartProps {
  series: SeriesPoint[]
  comparison?: SeriesPoint[]
  currency?: string
  ariaLabel: string
  minHeight?: number
  className?: string
  curve?: CurveMode
}

const PADDING_LEFT = 56
const PADDING_RIGHT = 24
const PADDING_Y = 32

const toDate = (value: string | Date) => (value instanceof Date ? value : new Date(value))
const chronological = (a: SeriesPoint, b: SeriesPoint) => toDate(a.date).getTime() - toDate(b.date).getTime()

export function AreaChart({
  series,
  comparison,
  currency = 'ARS',
  ariaLabel,
  minHeight = 200,
  className = '',
  curve = 'auto'
}: AreaChartProps) {
  const t = useTranslations('common.chart')
  const sortedSeries = useMemo(() => [...series].sort(chronological), [series])
  const sortedComparison = useMemo(() => (comparison ? [...comparison].sort(chronological) : undefined), [comparison])

  const dataTable =
    sortedSeries.length > 0
      ? sortedSeries.map((s) => ({
          label: s.date instanceof Date ? s.date.toISOString().split('T')[0] : String(s.date),
          value: s.value
        }))
      : undefined

  return (
    <ChartFrame ariaLabel={ariaLabel} dataTable={dataTable} minHeight={minHeight} className={className}>
      {(size) =>
        sortedSeries.length === 0 ? (
          <text x={size.width / 2} y={size.height / 2} textAnchor="middle" fill="currentColor" className="text-sm fill-muted-foreground">
            {t('notEnoughData')}
          </text>
        ) : (
          <AreaPlot size={size} series={sortedSeries} comparison={sortedComparison} currency={currency} curve={curve} />
        )
      }
    </ChartFrame>
  )
}

interface AreaPlotProps {
  size: ChartSize
  series: SeriesPoint[]
  comparison?: SeriesPoint[]
  currency: string
  curve: CurveMode
}

function AreaPlot({ size, series, comparison, currency, curve }: AreaPlotProps) {
  const { width, height } = size
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const gradientId = useId()

  const combinedPoints = useMemo(
    () => (comparison && comparison.length > 0 ? [...series, ...comparison] : series),
    [series, comparison]
  )

  const { x, y, ticksX, ticksY } = useChartScales({
    points: combinedPoints,
    width,
    height,
    paddingLeft: PADDING_LEFT,
    paddingRight: PADDING_RIGHT,
    paddingY: PADDING_Y
  })

  const minY = y.domain()[0]

  const curveType =
    curve === 'linear'
      ? curveLinear
      : curve === 'monotone'
      ? curveMonotoneX
      : series.length > 4
      ? curveMonotoneX
      : curveLinear

  const areaGenerator = area<SeriesPoint>()
    .x((d) => x(toDate(d.date)))
    .y0(y(minY))
    .y1((d) => y(d.value))
    .curve(curveType)

  const lineGenerator = line<SeriesPoint>()
    .x((d) => x(toDate(d.date)))
    .y((d) => y(d.value))
    .curve(curveType)

  const areaPath = areaGenerator(series) || ''
  const linePath = lineGenerator(series) || ''
  const comparisonLinePath = comparison ? lineGenerator(comparison) || '' : ''

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pointerX = PADDING_LEFT + (e.clientX - rect.left)

    let closestIdx = 0
    let minDistance = Infinity
    series.forEach((pt, i) => {
      const dist = Math.abs(x(toDate(pt.date)) - pointerX)
      if (dist < minDistance) {
        minDistance = dist
        closestIdx = i
      }
    })

    setHoverIndex(closestIdx)
  }

  const activeIdx = hoverIndex !== null && hoverIndex < series.length ? hoverIndex : series.length - 1
  const activePoint = series[activeIdx]

  const baseValue = series[0]?.value ?? 0
  const currentValue = activePoint.value
  const deltaValue = currentValue - baseValue
  const deltaPct = baseValue !== 0 ? (deltaValue / baseValue) * 100 : 0
  const isPositiveDelta = deltaValue >= 0

  const activeDate = toDate(activePoint.date)
  const day = String(activeDate.getDate()).padStart(2, '0')
  const monthOfYear = String(activeDate.getMonth() + 1).padStart(2, '0')
  const dateText = `${day}/${monthOfYear}`

  const valueText = `${currencySymbol(currency)} ${currentValue.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  const deltaText = formatPercent(deltaPct, { decimals: 1 })

  return (
    <>
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
        paddingLeft={PADDING_LEFT}
        paddingRight={PADDING_RIGHT}
        paddingY={PADDING_Y}
        formatY={(val) => formatCompactMoney(val, currency, 1)}
      />

      <path d={areaPath} fill={`url(#${gradientId})`} />

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

      <path data-role="line" d={linePath} fill="none" stroke="currentColor" strokeWidth={2} className="stroke-primary" />

      {series.map((p, i) => (
        <circle
          key={i}
          data-role="vertex"
          cx={x(toDate(p.date))}
          cy={y(p.value)}
          r={3}
          className="fill-primary stroke-background"
          strokeWidth={1.5}
        />
      ))}

      <rect
        data-testid="hover-area"
        x={PADDING_LEFT}
        y={0}
        width={Math.max(0, width - PADDING_LEFT - PADDING_RIGHT)}
        height={height}
        fill="transparent"
        className="cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      />

      <HoverMarker
        x={x(activeDate)}
        y={y(activePoint.value)}
        width={width}
        height={height}
        paddingY={PADDING_Y}
        dateText={dateText}
        valueText={valueText}
        deltaText={deltaText}
        isPositiveDelta={isPositiveDelta}
      />
    </>
  )
}
