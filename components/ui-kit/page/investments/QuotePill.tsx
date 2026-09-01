import { cn } from '@/lib/utils'

export interface Quote {
  code: string
  label: string
  value: string
  variation: number
  unit: 'PERCENT' | 'POINTS'
  observedAt: string
}

export interface QuotePillProps {
  quote: Quote
  className?: string
}

export function QuotePill({ quote, className }: QuotePillProps) {
  const { variation, unit } = quote
  const isNegative = variation < 0
  const abs = Math.abs(variation)

  // RIESGO_PAIS and any POINTS unit: display as absolute point delta (e.g. "−12 pts")
  // All other tickers: display as percent (e.g. "+2,5 %")
  const absFormatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(abs)

  const variationLabel =
    unit === 'POINTS'
      ? `${isNegative ? '−' : '+'}${abs} pts`
      : `${isNegative ? '−' : '+'}${absFormatted} %`

  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 rounded-lg border px-3 py-2 min-w-[5rem]',
        className
      )}
    >
      <span className="text-xs text-muted-foreground truncate">{quote.label}</span>
      <span className="n text-sm font-semibold tabular-nums">{quote.value}</span>
      <span
        className={cn(
          'n text-xs tabular-nums font-medium',
          isNegative ? 'text-loss' : 'text-gain'
        )}
      >
        {variationLabel}
      </span>
    </div>
  )
}
