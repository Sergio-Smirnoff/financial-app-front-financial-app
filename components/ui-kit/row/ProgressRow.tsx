import { cn } from '@/lib/utils'

export interface ProgressRowProps {
  label: string
  value: number
  max: number
  caption?: string
}

export function ProgressRow({ label, value, max, caption }: ProgressRowProps) {
  const pct = max > 0 ? (value / max) * 100 : 0
  const isOver = value > max
  const clampedPct = Math.min(pct, 100)

  return (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-foreground">{label}</span>
        <span className={cn('n', 'text-sm tabular-nums', isOver && 'text-destructive')}>
          {value} / {max}
        </span>
      </div>

      <div
        data-over={isOver || undefined}
        className={cn(
          'relative h-1.5 w-full rounded-full overflow-hidden bg-muted',
          isOver && 'bg-destructive/20'
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isOver ? 'bg-destructive' : 'bg-primary'
          )}
          style={{ width: `${clampedPct}%` }}
        />
      </div>

      {caption && (
        <span className="n text-xs text-muted-foreground">
          {caption ?? `${pct.toFixed(0)} %`}
        </span>
      )}
    </div>
  )
}
