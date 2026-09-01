'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { DueRow } from '@/components/ui-kit/row/ListRow'
import type { OverviewBff, Section } from '@/lib/api/bff/types'

export type UpcomingPaymentItem = NonNullable<
  NonNullable<OverviewBff['upcomingPayments']>['data']
>[number]

export interface UpcomingRailProps {
  section?: Section<UpcomingPaymentItem[]>
  isLoading: boolean
  onRetry?: () => void
}

export function UpcomingRail({ section, isLoading, onRetry }: UpcomingRailProps) {
  const t = useTranslations('overview')

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-40 rounded-xl bg-muted animate-pulse" />}
    >
      {(data) => (
        <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
          <h3 className="section-head">{t('upcomingTitle')}</h3>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('upcomingEmpty')}</p>
          ) : (
            <div className="space-y-3">
              {data.map((item) => (
                <Link key={item.id} href="/banks" className="block transition-opacity hover:opacity-80">
                  <DueRow label={item.label ?? ''} dueDate={item.dueDate ?? ''} amount={item.amount} />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </SectionState>
  )
}
