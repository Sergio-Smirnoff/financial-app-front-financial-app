'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { DueRow } from '@/components/ui-kit/row/ListRow'
import { cn } from '@/lib/utils'
import type { OverviewBff, Section } from '@/lib/api/bff/types'

export type UpcomingPaymentItem = NonNullable<
  NonNullable<OverviewBff['upcomingPayments']>['data']
>[number]

export interface UpcomingRailProps {
  section?: Section<UpcomingPaymentItem[]>
  isLoading: boolean
  onRetry?: () => void
  className?: string
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
        <div className={cn('elev-sm flex flex-col gap-4 rounded-xl border bg-card p-5 short:gap-2 short:p-4', className)}>
          <h3 className="section-head">{t('upcomingTitle')}</h3>
          <div className="space-y-3">
            {data.map((item) => (
              <Link key={item.id} href="/banks" className="block transition-opacity hover:opacity-80">
                <DueRow label={item.label ?? ''} dueDate={item.dueDate ?? ''} amount={item.amount} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </SectionState>
  )
}
