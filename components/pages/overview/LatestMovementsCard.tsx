'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { Money } from '@/components/ui-kit/money/Money'
import { Button } from '@/components/ui/button'
import { useFitCount } from '@/lib/hooks/useFitCount'
import { cn } from '@/lib/utils'
import type { Section, TransactionRow } from '@/lib/api/bff/types'

export interface LatestMovementsCardProps {
  section?: Section<TransactionRow[]>
  isLoading: boolean
  onRetry?: () => void
  className?: string
}

function LatestList({ rows }: { rows: TransactionRow[] }) {
  const t = useTranslations('overview')
  const { ref, count, framed } = useFitCount<HTMLUListElement>(rows.length)
  const none = framed && count === 0

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        {!none && <h3 className="section-head">{t('latestTitle')}</h3>}
        <Link href="/transactions" data-testid="latest-more" className="text-xs font-medium text-primary hover:underline">
          {none ? t('latest.more') : t('latest.seeAll')}
        </Link>
      </div>
      <ul ref={ref} data-testid="latest-list" aria-label={t('latest.caption')} className="relative min-h-0 overflow-hidden frame:flex-1">
        {rows.map((row, index) => (
          <li
            key={row.id}
            data-testid="latest-row"
            hidden={index >= count}
            title={`${row.description} · ${row.categoryName || t('latest.uncategorised')}`}
            className="flex items-baseline justify-between gap-3 border-b py-2 text-sm last:border-0"
          >
            <span className="min-w-0 truncate">
              <span className="mr-1.5 text-xs text-muted-foreground">{row.date}</span>
              {row.description}
            </span>
            <span className="shrink-0 whitespace-nowrap">
              <Money value={row.amount} tone={row.direction === 'IN' ? 'gain' : 'loss'} />
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}

export function LatestMovementsCard({ section, isLoading, onRetry, className }: LatestMovementsCardProps) {
  const t = useTranslations('overview')

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      emptyAction={
        <Link href="/transactions">
          <Button size="sm">{t('latest.emptyAction')}</Button>
        </Link>
      }
      skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse frame:h-auto frame:min-h-0 frame:flex-1" />}
    >
      {(data) => (
        <div className={cn('elev-sm flex min-h-0 flex-col gap-3 rounded-xl border bg-card p-5 frame:gap-2 frame:p-4', className)}>
          <LatestList rows={data} />
        </div>
      )}
    </SectionState>
  )
}
