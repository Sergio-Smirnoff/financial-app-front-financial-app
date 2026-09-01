import React from 'react'

export interface HoverMarkerProps {
  x: number
  y: number
  height: number
  paddingY?: number
  dateText: string
  valueText: string
  deltaText?: string
  isPositiveDelta?: boolean
}

export function HoverMarker({
  x,
  y,
  height,
  paddingY = 32,
  dateText,
  valueText,
  deltaText,
  isPositiveDelta = true
}: HoverMarkerProps) {
  const deltaSymbol = deltaText ? (isPositiveDelta ? '+' : '−') : ''
  const displayDelta = deltaText ? (deltaText.startsWith('+') || deltaText.startsWith('-') || deltaText.startsWith('−') ? deltaText : `${deltaSymbol}${deltaText}`) : ''

  return (
    <g className="hover-marker pointer-events-none">
      {/* Vertical guideline */}
      <line
        x1={x}
        y1={paddingY}
        x2={x}
        y2={height - paddingY}
        stroke="currentColor"
        strokeOpacity={0.4}
        strokeDasharray="3 3"
      />

      {/* Target point indicator */}
      <circle cx={x} cy={y} r={5} fill="currentColor" className="text-primary" />
      <circle cx={x} cy={y} r={3} fill="white" />

      {/* Tooltip */}
      <g role="tooltip" transform={`translate(${x > 400 ? x - 140 : x + 10}, ${Math.max(paddingY, y - 40)})`}>
        <rect
          width={130}
          height={42}
          rx={6}
          className="fill-popover stroke-border"
          strokeWidth={1}
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
        />
        <text x={8} y={16} className="fill-popover-foreground text-[11px] font-medium font-sans">
          {dateText}
        </text>
        <text x={8} y={32} className="fill-popover-foreground text-[11px] font-bold font-mono">
          {valueText} {displayDelta && <tspan className={isPositiveDelta ? 'fill-emerald-600 dark:fill-emerald-400' : 'fill-rose-600 dark:fill-rose-400'}> ({displayDelta})</tspan>}
        </text>
      </g>
    </g>
  )
}
