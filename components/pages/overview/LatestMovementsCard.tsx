'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { ScrollTable } from '@/components/ui-kit/table/ScrollTable'
import { Money } from '@/components/ui-kit/money/Money'
import { Button } from '@/components/ui/button'
import type { Section, TransactionRow } from '@/lib/api/bff/types'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'

export interface LatestMovementsCardProps {
  section?: Section<TransactionRow[]>
  isLoading: boolean
  onRetry?: () => void
}

export function LatestMovementsCard({ section, isLoading, onRetry }: LatestMovementsCardProps) {
  const t = useTranslations('overview')

  const columns: ColumnDef<TransactionRow, unknown>[] = React.useMemo(
    () => [
      {
        id: 'date',
        accessorKey: 'date',
        header: t('latest.date'),
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: t('latest.description'),
      },
      {
        id: 'category',
        accessorFn: (row) => row.categoryName || t('latest.uncategorised'),
        header: t('latest.category'),
      },
      {
        id: 'amount',
        accessorFn: (row) => row,
        header: t('latest.amount'),
        cell: ({ getValue }) => {
          const row = getValue() as TransactionRow
          return <Money value={row.amount} tone={row.direction === 'IN' ? 'gain' : 'loss'} />
        },
      },
    ],
    [t],
  )

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
      skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
    >
      {(data) => (
        <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="section-head">{t('latestTitle')}</h3>
            <Link href="/transactions" className="text-xs font-medium text-primary hover:underline">
              {t('latest.seeAll')}
            </Link>
          </div>
          <ScrollTable columns={columns} rows={data} caption={t('latest.caption')} maxHeight={320} />
        </div>
      )}
    </SectionState>
  )
}
