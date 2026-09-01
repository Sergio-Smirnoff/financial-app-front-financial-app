import type { MoneyView } from '@/lib/format'
import { formatPercent } from '@/lib/format'
import { Money } from './Money'
import { cn } from '@/lib/utils'

export interface DeltaBadgeProps {
  pct: number
  absolute?: MoneyView
  className?: string
}

export function DeltaBadge({ pct, absolute, className }: DeltaBadgeProps) {
  const isGain = pct > 0
  const isLoss = pct < 0

  const glyph = isGain ? '↑' : isLoss ? '↓' : '→'
  const toneClass = isGain
    ? 'bg-[var(--gain-tint)] text-[var(--gain-pill-text)]'
    : isLoss
      ? 'bg-[var(--loss-tint)] text-[var(--loss-pill-text)]'
      : 'tag-neutral'

  return (
    <span
      className={cn(
        'tag inline-flex items-center gap-1 font-medium',
        toneClass,
        className
      )}
    >
      <span aria-hidden="true">{glyph}</span>
      <span>{formatPercent(pct)}</span>
      {absolute && (
        <span className="ml-1 opacity-90">
          (<Money value={absolute} />)
        </span>
      )}
    </span>
  )
}
