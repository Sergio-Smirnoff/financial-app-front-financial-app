'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export interface PaginationProps {
  page: number
  totalPages: number
  onChange: (p: number) => void
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  const t = useTranslations('common')

  if (totalPages <= 1) return null

  return (
    <nav aria-label={t('pagination')} className="flex items-center justify-center gap-2 py-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label={t('previousPage')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-sm text-muted-foreground">
        {t('pageOf', { page, total: totalPages })}
      </span>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label={t('nextPage')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
