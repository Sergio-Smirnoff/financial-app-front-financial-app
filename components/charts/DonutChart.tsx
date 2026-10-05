'use client'

import React from 'react'
import { arc, pie, type PieArcDatum } from 'd3-shape'
import { ChartFrame } from './primitives/ChartFrame'
import { formatPercent } from '@/lib/format'

export interface DonutSlice {
  key: string
  label: string
  value: number
  pct: number
  color: string
}

export interface DonutChartProps {
  slices: DonutSlice[]
  ariaLabel: string
  centerLabel: string
  centerValue: string
  centerDelta?: { text: string; tone: 'gain' | 'loss' | 'neutral' }
  minLabelPct?: number
  minHeight?: number
  className?: string
}

const RING_RATIO = 0.62
const MIN_LABELLED_RADIUS = 56
const TONE_FILL = { gain: 'fill-gain', loss: 'fill-loss', neutral: 'fill-muted-foreground' } as const

const share = (pct: number) => formatPercent(pct, { decimals: 1, signed: false })

export function DonutChart({
  slices,
  ariaLabel,
  centerLabel,
  centerValue,
  centerDelta,
  minLabelPct = 4,
  minHeight,
  className,
}: DonutChartProps) {
  const drawn = slices.filter((s) => s.value > 0)
  if (drawn.length === 0) return null

  return (
    <ChartFrame
      ariaLabel={ariaLabel}
      className={className}
      minHeight={minHeight}
      dataTable={drawn.map((s) => ({ label: s.label, value: share(s.pct) }))}
    >
      {({ width, height }) => {
        const outer = Math.max(0, Math.min(width, height) / 2 - 2)
        const inner = outer * RING_RATIO
        const labelRadius = (inner + outer) / 2
        const arcs = pie<DonutSlice>().value((s) => s.value).sort(null)(drawn)
        const ring = arc<PieArcDatum<DonutSlice>>()
          .innerRadius(inner)
          .outerRadius(outer)
          .padAngle(drawn.length > 1 ? 0.012 : 0)
        const labelArc = arc<PieArcDatum<DonutSlice>>().innerRadius(labelRadius).outerRadius(labelRadius)
        const labelled = outer >= MIN_LABELLED_RADIUS ? arcs.filter((a) => a.data.pct >= minLabelPct) : []

        return (
          <g transform={`translate(${width / 2},${height / 2})`}>
            {arcs.map((a) => (
              <path key={a.data.key} data-role="slice" data-slice={a.data.key} d={ring(a) ?? ''} fill={a.data.color} />
            ))}
            {labelled.map((a) => {
              const [x, y] = labelArc.centroid(a)
              return (
                <text
                  key={a.data.key}
                  data-role="slice-label"
                  textAnchor="middle"
                  stroke="var(--card)"
                  strokeWidth={3}
                  paintOrder="stroke"
                  className="fill-foreground"
                >
                  <tspan x={x} y={y} dy="-0.15em" fontSize={12} fontWeight={700}>
                    {share(a.data.pct)}
                  </tspan>
                  <tspan x={x} dy="1.2em" fontSize={10} className="fill-muted-foreground">
                    {a.data.label}
                  </tspan>
                </text>
              )
            })}
            <text data-role="center" textAnchor="middle">
              <tspan x={0} dy="-0.9em" fontSize={10} letterSpacing="0.1em" className="fill-muted-foreground">
                {centerLabel}
              </tspan>
              <tspan x={0} dy="1.4em" fontSize={Math.max(12, Math.min(18, inner / 4.2))} fontWeight={700} className="fill-foreground">
                {centerValue}
              </tspan>
              {centerDelta && (
                <tspan x={0} dy="1.4em" fontSize={12} className={TONE_FILL[centerDelta.tone]}>
                  {centerDelta.text}
                </tspan>
              )}
            </text>
          </g>
        )
      }}
    </ChartFrame>
  )
}
