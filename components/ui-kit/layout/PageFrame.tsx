import * as React from 'react'
import { cn } from '@/lib/utils'

export interface PageFrameProps {
  children: React.ReactNode
  className?: string
}

export function PageFrame({ children, className }: PageFrameProps) {
  return (
    <main
      data-page-frame
      className={cn(
        '@container/page flex h-full flex-col gap-6 overflow-auto p-6 max-md:gap-4.5 max-md:p-4 frame:gap-4 frame:overflow-hidden short:gap-3 short:px-5 short:py-3.5',
        className,
      )}
    >
      {children}
    </main>
  )
}

export function PageFrameFill({ children, className }: PageFrameProps) {
  return <div className={cn('frame:min-h-0 frame:flex-1', className)}>{children}</div>
}
