import { cn } from '@/lib/utils'

export interface StatusDotProps {
  tone: 'ok' | 'warn' | 'error' | 'neutral'
  label: string
  className?: string
}

export function StatusDot({ tone, label, className }: StatusDotProps) {
  return (
    <span className={cn('flex items-center gap-1.5', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'status-dot',
          `status-dot--${tone}`,
          'inline-block h-2 w-2 rounded-full',
          tone === 'ok' && 'bg-gain',
          tone === 'warn' && 'bg-warning',
          tone === 'error' && 'bg-destructive',
          tone === 'neutral' && 'bg-muted-foreground'
        )}
      />
      <span className="text-sm">{label}</span>
    </span>
  )
}
