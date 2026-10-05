import { useTranslations } from 'next-intl'
import { formatPercent, formatSignedNumber } from '@/lib/format'
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
  const t = useTranslations('common')
  const { variation, unit } = quote
  const variationLabel =
    unit === 'POINTS' ? t('points', { value: formatSignedNumber(variation) }) : formatPercent(variation)

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
          variation < 0 ? 'text-loss' : 'text-gain'
        )}
      >
        {variationLabel}
      </span>
    </div>
  )
}
