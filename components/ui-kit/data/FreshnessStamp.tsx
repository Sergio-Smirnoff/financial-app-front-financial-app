import { formatDistanceToNow, parseISO, differenceInMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export interface FreshnessStampProps {
  observedAt: string
  className?: string
}

const STALE_THRESHOLD_MINUTES = 60

export function FreshnessStamp({ observedAt, className }: FreshnessStampProps) {
  const date = parseISO(observedAt)
  const ageMinutes = differenceInMinutes(new Date(), date)
  const isStale = ageMinutes > STALE_THRESHOLD_MINUTES

  const label = formatDistanceToNow(date, { addSuffix: true, locale: es })

  return (
    <span
      role="status"
      aria-live="off"
      data-stale={isStale ? 'true' : undefined}
      title={observedAt}
      className={cn(
        'inline-flex items-center gap-1 text-xs',
        isStale ? 'text-warning' : 'text-muted-foreground',
        className
      )}
    >
      {label}
      {isStale && <span aria-hidden="true">⚠</span>}
    </span>
  )
}
