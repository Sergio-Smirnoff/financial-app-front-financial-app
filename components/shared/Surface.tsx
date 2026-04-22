import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface SurfaceProps extends React.ComponentProps<typeof Card> {
  variant?: 'default' | 'accent' | 'glass'
}

export function Surface({ className, variant = 'default', ...props }: SurfaceProps) {
  const variants = {
    default: 'bg-card text-card-foreground border-border',
    accent: 'bg-muted/50 border-border',
    glass: 'bg-background/50 backdrop-blur-sm border-border',
  }

  return (
    <Card
      className={cn(
        'transition-colors shadow-none',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
