'use client'

import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export interface BulkActionBarProps {
  count: number
  actions: { label: string; onSelect: () => void }[]
  onClear: () => void
}

export function BulkActionBar({ count, actions, onClear }: BulkActionBarProps) {
  const t = useTranslations('common')

  if (count === 0) {
    return (
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {t('noRowsSelected')}
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
      <span className="font-medium">{t('rowsSelected', { count })}</span>

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
        aria-label={t('clearSelection')}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
