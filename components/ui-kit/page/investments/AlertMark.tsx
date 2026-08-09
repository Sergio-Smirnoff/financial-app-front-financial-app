import { cn } from '@/lib/utils'
import { AlertTriangle, Bell } from 'lucide-react'

export interface AlertMarkProps {
  /** Visual tone of the alert indicator */
  tone?: 'warn' | 'error' | 'info'
  /** Required label — colour is never the only signal */
  label: string
  className?: string
}

export function AlertMark({ tone = 'warn', label, className }: AlertMarkProps) {
  const Icon = tone === 'info' ? Bell : AlertTriangle

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        tone === 'warn' && 'text-warn',
        tone === 'error' && 'text-destructive',
        tone === 'info' && 'text-muted-foreground',
        className,
      )}
      aria-label={label}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
