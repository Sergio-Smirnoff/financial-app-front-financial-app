import * as React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

export interface InlineBannerProps {
  title?: string
  description: string
  tone?: 'info' | 'warn' | 'error' | 'success'
  action?: React.ReactNode
  onClose?: () => void
  className?: string
}

export function InlineBanner({
  title,
  description,
  tone = 'info',
  action,
  onClose,
  className,
}: InlineBannerProps) {
  const iconMap = {
    info: <Info className="h-4 w-4 text-accent-500 shrink-0 mt-0.5" />,
    warn: <AlertTriangle className="h-4 w-4 text-warn shrink-0 mt-0.5" />,
    error: <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="h-4 w-4 text-gain shrink-0 mt-0.5" />,
  }

  const borderTone = {
    info: 'border-accent-200 bg-accent-50/50 dark:border-accent-800 dark:bg-accent-950/50',
    warn: 'border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/30',
    error: 'border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/30',
    success: 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/30',
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3.5 rounded-lg border text-sm',
        borderTone[tone],
        className
      )}
    >
      {iconMap[tone]}
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-medium text-foreground leading-none">{title}</h5>}
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {onClose && (
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground shrink-0 p-0.5 rounded-md focus-visible:outline-none"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
