'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface BulkActionBarProps {
  count: number
  actions: { label: string; onSelect: () => void }[]
  onClear: () => void
}

export function BulkActionBar({ count, actions, onClear }: BulkActionBarProps) {
  if (count === 0) {
    return (
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        Sin filas seleccionadas
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="flex items-center gap-3 rounded-lg border bg-primary/5 px-4 py-2 text-sm"
    >
      <span className="font-medium">
        {count} {count === 1 ? 'seleccionado' : 'seleccionados'}
      </span>

      <div className="flex items-center gap-2 ml-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            onClick={action.onSelect}
          >
            {action.label}
          </Button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="ml-auto h-7 w-7"
        onClick={onClear}
        aria-label="Limpiar selección"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
