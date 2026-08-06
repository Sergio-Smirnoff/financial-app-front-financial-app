import * as React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

export interface ToastProps {
  title?: string
  description: string
  tone?: 'info' | 'warn' | 'error' | 'success'
  action?: React.ReactNode
  onClose?: () => void
  className?: string
}

export function Toast({
  title,
  description,
  tone = 'info',
  action,
  onClose,
  className,
}: ToastProps) {
  const iconMap = {
    info: <Info className="h-4 w-4 text-primary shrink-0" />,
    warn: <AlertTriangle className="h-4 w-4 text-warn shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-destructive shrink-0" />,
    success: <CheckCircle2 className="h-4 w-4 text-gain shrink-0" />,
  }

  return (
    <div
      className={cn(
        'elev-md bg-card text-card-foreground border rounded-lg p-4 flex items-start gap-3 text-sm max-w-sm',
        className
      )}
      role="status"
    >
      {iconMap[tone]}
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium text-foreground">{title}</p>}
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {onClose && (
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground shrink-0 p-1"
          aria-label="Cerrar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
