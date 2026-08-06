import React from 'react'
import { LegendList, CompositionSlice } from './LegendList'

export interface CompositionBarProps {
  slices: CompositionSlice[]
  className?: string
  showLegend?: boolean
}

const DEFAULT_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500'
]

export function CompositionBar({ slices, className = '', showLegend = true }: CompositionBarProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Track bar */}
      <div
        className="w-full h-3 rounded-full overflow-hidden flex bg-muted/30 p-0.5 gap-0.5"
        role="progressbar"
        aria-label="Composición"
      >
        {slices.map((slice, i) => {
          const colorClass = slice.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]
          return (
            <div
              key={i}
              data-slice={slice.label}
              data-pct={slice.pct}
              style={{ width: `${slice.pct}%` }}
              className={`h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 ${colorClass}`}
              title={`${slice.label}: ${slice.pct.toFixed(1)}%`}
            />
          )
        })}
      </div>

      {/* Legend list */}
      {showLegend && <LegendList slices={slices} />}
    </div>
  )
}
