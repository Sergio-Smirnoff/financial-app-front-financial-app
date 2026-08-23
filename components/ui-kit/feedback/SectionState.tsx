import * as React from 'react'
import type { Section } from '@/lib/api/bff/types'
import { useSection } from '@/lib/hooks/useSection'
import { Button } from '@/components/ui/button'

export interface SectionStateProps<T> {
  section: Section<T> | undefined
  isLoading: boolean
  skeleton: React.ReactNode
  emptyAction?: React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
  emptyTestId?: string
  onRetry?: () => void
  children: (data: T, observedAt: string) => React.ReactNode
}

export function SectionState<T>({
  section,
  isLoading,
  skeleton,
  emptyAction,
  emptyTitle = 'Todavía no hay datos',
  emptyDescription,
  emptyTestId,
  onRetry,
  children,
}: SectionStateProps<T>): React.ReactNode {
  const stateResult = useSection(section, isLoading)

  if (stateResult.state === 'loading') {
    return <>{skeleton}</>
  }

  if (stateResult.state === 'unavailable') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-card text-card-foreground">
        <p className="text-sm font-medium text-destructive">No pudimos cargar esta sección</p>
        <p className="mt-1 text-xs text-muted-foreground">El resto de la página sigue disponible</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
            Reintentar
          </Button>
        )}
      </div>
    )
  }

  if (stateResult.state === 'empty') {
    return (
      <div data-testid={emptyTestId} className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-card text-card-foreground">
        <p className="text-sm font-medium text-muted-foreground">{emptyTitle}</p>
        {emptyDescription && <p className="mt-1 text-xs text-muted-foreground">{emptyDescription}</p>}
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    )
  }

  return <>{children(stateResult.data, stateResult.observedAt)}</>
}
