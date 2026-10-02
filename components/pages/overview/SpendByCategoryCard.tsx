'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { ProgressRow } from '@/components/ui-kit/row/ProgressRow'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { OverviewBff, Section } from '@/lib/api/bff/types'

export type SpendCategoryItem = NonNullable<
  NonNullable<OverviewBff['spendByCategory']>['data']
>[number]

export interface SpendByCategoryCardProps {
  section?: Section<SpendCategoryItem[]>
  isLoading: boolean
  onRetry?: () => void
  className?: string
}

export function SpendByCategoryCard({ section, isLoading, onRetry, className }: SpendByCategoryCardProps) {
  const t = useTranslations('overview')

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      emptyTitle={t('spendEmpty')}
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
    >
      {(data) => (
        <div className={cn('elev-sm flex flex-col gap-4 rounded-xl border bg-card p-5 frame:gap-1 frame:p-4', className)}>
          <h3 className="section-head">{t('spendTitle')}</h3>
          <div className="space-y-3 frame:space-y-0">
            {data.map((item) => (
              <ProgressRow
                key={item.categoryId}
                label={item.name ?? ''}
                share={item.pct ?? 0}
                valueText={
                  item.amount
                    ? formatMoney({ amount: item.amount.amount, currency: item.amount.currency }, { decimals: 0 })
                    : '—'
                }
              />
            ))}
          </div>
        </div>
      )}
    </SectionState>
  )
}
