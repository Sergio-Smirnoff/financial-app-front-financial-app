'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { DueRow } from '@/components/ui-kit/row/ListRow'
import { useFitCount } from '@/lib/hooks/useFitCount'
import { cn } from '@/lib/utils'
import type { OverviewBff, Section } from '@/lib/api/bff/types'
import { CardHeader } from '@/components/ui-kit/layout/CardHeader'

export type UpcomingPaymentItem = NonNullable<
  NonNullable<OverviewBff['upcomingPayments']>['data']
>[number]

export interface UpcomingRailProps {
  section?: Section<UpcomingPaymentItem[]>
  isLoading: boolean
  onRetry?: () => void
  className?: string
}

function UpcomingList({ items }: { items: UpcomingPaymentItem[] }) {
  const t = useTranslations('overview')
  const { ref, count } = useFitCount<HTMLUListElement>(items.length)
  const hidesSome = count < items.length

  return (
    <>
      <CardHeader
        title={t('upcomingTitle')}
        action={
          hidesSome && (
            <Link href="/banks" data-testid="upcoming-more" className="text-xs font-medium text-primary hover:underline">
              {t('upcomingMore')}
            </Link>
          )
        }
      />
      <ul
        ref={ref}
        data-testid="upcoming-list"
        aria-label={t('upcomingTitle')}
        className="relative min-h-0 space-y-3 overflow-hidden frame:flex-1 frame:space-y-2"
      >
        {items.map((item, index) => (
          <li key={item.id} data-testid="upcoming-row" hidden={index >= count}>
            <Link href="/banks" className="block transition-opacity hover:opacity-80">
              <DueRow label={item.label ?? ''} dueDate={item.dueDate ?? ''} amount={item.amount} />
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

export function UpcomingRail({ section, isLoading, onRetry, className }: UpcomingRailProps) {
  const t = useTranslations('overview')

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      emptyTitle={t('upcomingEmpty')}
      skeleton={<div className="h-40 rounded-xl bg-muted animate-pulse" />}
    >
      {(data) => (
        <div className={cn('elev-sm flex min-h-0 flex-col gap-4 rounded-xl border bg-card p-5 frame:min-h-16 frame:gap-2 frame:p-4', className)}>
          <UpcomingList items={data} />
        </div>
      )}
    </SectionState>
  )
}
