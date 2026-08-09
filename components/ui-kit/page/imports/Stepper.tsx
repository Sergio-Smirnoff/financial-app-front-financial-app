import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface StepperProps {
  steps: string[]
  current: number
  className?: string
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <nav aria-label="Pasos del proceso" className={cn('flex items-center gap-0', className)}>
      {steps.map((step, index) => {
        const isDone = index < current
        const isCurrent = index === current
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <div
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium border-2 transition-colors',
                  isDone && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'border-primary text-primary bg-primary/10',
                  !isDone && !isCurrent && 'border-muted text-muted-foreground bg-background',
                )}
              >
                {isDone ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
              </div>
              <span
                className={cn(
                  'text-xs whitespace-nowrap',
                  isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground',
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-2 mb-4 transition-colors',
                  isDone ? 'bg-primary' : 'bg-border',
                )}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
