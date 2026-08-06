import React from 'react'

export interface CompositionSlice {
  label: string
  amount: string | number | { amount: string | number; currency?: string }
  pct: number
  color?: string
}

export interface LegendListProps {
  slices: CompositionSlice[]
  className?: string
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

export function formatSliceAmount(amt: CompositionSlice['amount']): string {
  if (typeof amt === 'string') return amt
  if (typeof amt === 'number') return `$ ${amt.toLocaleString('es-AR')}`
  if (amt && typeof amt === 'object') {
    const num = Number(amt.amount)
    const sym = amt.currency === 'USD' ? 'US$' : '$'
    return `${sym} ${isNaN(num) ? amt.amount : num.toLocaleString('es-AR')}`
  }
  return String(amt)
}

export function formatSlicePct(pct: number): string {
  const formatted = pct.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return `+${formatted} %`
}

export function LegendList({ slices, className = '' }: LegendListProps) {
  return (
    <ul className={`space-y-2 font-sans ${className}`}>
      {slices.map((slice, i) => {
        const colorClass = slice.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]
        const amountStr = formatSliceAmount(slice.amount)
        const pctStr = formatSlicePct(slice.pct)

        return (
          <li key={i} className="flex items-center justify-between text-xs py-0.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${colorClass}`} />
              <span className="font-medium text-foreground truncate">{slice.label}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4 font-mono text-xs">
              <span className="text-muted-foreground">{amountStr}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{pctStr}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
