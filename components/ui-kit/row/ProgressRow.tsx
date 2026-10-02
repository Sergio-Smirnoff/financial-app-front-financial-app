import { cn } from '@/lib/utils'
import { formatPercent } from '@/lib/format'

interface CappedProgress {
  value: number
  max: number
  share?: never
  valueText?: never
}

interface ShareProgress {
  share: number
  valueText: string
  value?: never
  max?: never
}

export type ProgressRowProps = { label: string; caption?: string } & (CappedProgress | ShareProgress)

const isShareProgress = (props: ProgressRowProps): props is ProgressRowProps & ShareProgress =>
  typeof props.share === 'number'

function figures(props: ProgressRowProps): { pct: number; isOver: boolean; text: string } {
  if (isShareProgress(props)) {
    return {
      pct: Math.max(0, props.share),
      isOver: false,
      text: `${props.valueText} · ${formatPercent(props.share, { decimals: 1, signed: false })}`,
    }
  }
  const pct = props.max > 0 ? (props.value / props.max) * 100 : 0
  return { pct, isOver: props.value > props.max, text: `${props.value} / ${props.max}` }
}

export function ProgressRow(props: ProgressRowProps) {
  const { label, caption } = props
  const { pct, isOver, text } = figures(props)
  const clampedPct = Math.min(pct, 100)

  return (
    <div className="flex flex-col gap-1.5 py-2">
      <div className="flex items-center justify-between gap-4">
        <span className="min-w-0 truncate text-sm text-foreground">{label}</span>
        <span className={cn('n', 'shrink-0 whitespace-nowrap text-sm tabular-nums', isOver && 'text-destructive')}>{text}</span>
      </div>

      <div
        data-over={isOver || undefined}
        className={cn('relative h-1.5 w-full rounded-full overflow-hidden bg-muted', isOver && 'bg-destructive/20')}
      >
        <div
          className={cn('h-full rounded-full transition-all', isOver ? 'bg-destructive' : 'bg-primary')}
          style={{ width: `${clampedPct}%` }}
        />
      </div>

      {caption && <span className="n text-xs text-muted-foreground">{caption}</span>}
    </div>
  )
}
