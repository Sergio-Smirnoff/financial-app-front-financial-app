import * as React from 'react'
import { cn } from '@/lib/utils'

export interface CardHeaderProps {
  title: string
  action?: React.ReactNode
  titleHidden?: boolean
}

export function CardHeader({ title, action, titleHidden = false }: CardHeaderProps) {
  return (
    <div className="flex h-5 shrink-0 items-center justify-between gap-3">
      <h3 title={title} className={cn('section-head min-w-0 truncate', titleHidden && 'sr-only')}>
        {title}
      </h3>
      {action && <div className="flex shrink-0 items-center whitespace-nowrap">{action}</div>}
    </div>
  )
}
