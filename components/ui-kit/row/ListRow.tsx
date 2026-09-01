import { useTranslations } from 'next-intl'
import { Money } from '@/components/ui-kit/money/Money'
import type { MoneyView } from '@/lib/format'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export interface ListRowProps {
  label: string
  sublabel?: string
  right?: React.ReactNode
  className?: string
  onClick?: () => void
}

export function ListRow({ label, sublabel, right, className, onClick }: ListRowProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      className={cn(
        'flex items-center justify-between gap-4 py-3 px-4 border-b last:border-b-0 transition-colors',
        onClick && 'hover:bg-muted/30 cursor-pointer',
        className
      )}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium truncate">{label}</span>
        {sublabel && (
          <span className="text-xs text-muted-foreground truncate">{sublabel}</span>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}

export interface DueRowProps {
  dueDate: string
  label: string
  amount: MoneyView | null | undefined
  className?: string
}

export function DueRow({ dueDate, label, amount, className }: DueRowProps) {
  const formatted = formatDate(dueDate)
  return (
    <ListRow
      label={label}
      sublabel={formatted}
      right={<Money value={amount} />}
      className={className}
    />
  )
}

export interface RowFlagProps {
  type: 'duplicate' | 'failed' | 'warning'
  label?: string
  className?: string
}

const ROW_FLAG_KEYS: Record<RowFlagProps['type'], string> = {
  duplicate: 'flagDuplicate',
  failed: 'flagFailed',
  warning: 'flagWarning',
}

export function RowFlag({ type, label, className }: RowFlagProps) {
  const t = useTranslations('common')
  const colors: Record<RowFlagProps['type'], string> = {
    duplicate: 'bg-warning',
    failed: 'bg-destructive',
    warning: 'bg-warning',
  }
  const name = label ?? t(ROW_FLAG_KEYS[type])
  return (
    <span
      aria-label={name}
      title={name}
      className={cn('inline-block w-1 rounded-r-full', colors[type], className)}
    />
  )
}
