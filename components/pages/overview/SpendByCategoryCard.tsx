'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { ProgressRow } from '@/components/ui-kit/row/ProgressRow'
import { formatMoney } from '@/lib/format'
import { useFitCount } from '@/lib/hooks/useFitCount'
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

const spentOf = (item: SpendCategoryItem) => Number(item.amount?.amount ?? 0) || 0

const largestFirst = (a: SpendCategoryItem, b: SpendCategoryItem) =>
  spentOf(b) - spentOf(a) || (b.pct ?? 0) - (a.pct ?? 0)

function SpendList({ items }: { items: SpendCategoryItem[] }) {
  const t = useTranslations('overview')
  const sorted = useMemo(() => [...items].sort(largestFirst), [items])
  const { ref, count, framed } = useFitCount<HTMLUListElement>(sorted.length)
  const none = framed && count === 0
  const hidesSome = count < sorted.length

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        {!none && <h3 className="section-head">{t('spendTitle')}</h3>}
        {hidesSome && (
          <Link href="/categories" data-testid="spend-more" className="text-xs font-medium text-primary hover:underline">
            {t('spendMore')}
          </Link>
        )}
      </div>
      <ul
        ref={ref}
        data-testid="spend-list"
        aria-label={t('spendTitle')}
        className="relative min-h-0 space-y-3 overflow-hidden frame:flex-1 frame:space-y-0"
      >
        {sorted.map((item, index) => (
          <li key={item.categoryId} data-testid="spend-row" data-name={item.name ?? ''} hidden={index >= count}>
            <ProgressRow
              label={item.name ?? ''}
              share={item.pct ?? 0}
              valueText={
                item.amount
                  ? formatMoney({ amount: item.amount.amount, currency: item.amount.currency }, { decimals: 0 })
                  : '—'
              }
            />
          </li>
        ))}
      </ul>
    </>
  )
}

export function SpendByCategoryCard({ section, isLoading, onRetry, className }: SpendByCategoryCardProps) {
  const t = useTranslations('overview')

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      emptyTitle={t('spendEmpty')}
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse frame:min-h-0" />}
    >
      {(data) => (
        <div className={cn('elev-sm flex min-h-0 flex-col gap-4 rounded-xl border bg-card p-5 frame:gap-1 frame:p-4', className)}>
          <SpendList items={data} />
        </div>
      )}
    </SectionState>
  )
}
