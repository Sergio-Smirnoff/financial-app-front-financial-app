'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { ProgressRow } from '@/components/ui-kit/row/ProgressRow'
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
        <div className={cn('elev-sm flex flex-col gap-4 rounded-xl border bg-card p-5', className)}>
          <h3 className="section-head">{t('spendTitle')}</h3>
          <div className="space-y-3">
            {data.map((item) => {
              const val = parseFloat(item.amount?.amount || '0')
              const pct = item.pct
              return (
                <ProgressRow
                  key={item.categoryId}
                  label={item.name ?? ''}
                  value={val}
                  max={val > 0 ? (val * 100) / Math.max(1, pct ?? 0) : 100}
                  caption={pct != null ? `${pct.toFixed(1)} %` : undefined}
                />
              )
            })}
          </div>
        </div>
      )}
    </SectionState>
  )
}
