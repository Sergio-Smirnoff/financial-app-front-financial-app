'use client'

import React, { useState } from 'react'
import { useQueryState, parseAsInteger } from 'nuqs'
import { useTranslations } from 'next-intl'
import { useTransactionsPage } from '@/lib/hooks/useTransactionsPage'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { Pagination } from '@/components/ui-kit/table/Pagination'
import { TransactionFilters } from './TransactionFilters'
import { TransactionTable } from './TransactionTable'
import { UncategorisedBanner } from './UncategorisedBanner'
import { BulkCategoriseBar } from './BulkCategoriseBar'
import { TransactionDetailPanel } from './TransactionDetailPanel'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import { Money } from '@/components/ui-kit/money/Money'
import { useQueryClient } from '@tanstack/react-query'
import type { BffQuery } from '@/lib/api/bff/types'
import type { RowSelectionState } from '@tanstack/react-table'

export interface TransactionsContentProps {
  query?: BffQuery
}

const SkeletonBanner = () => <div className="h-12 w-full rounded-xl bg-muted animate-pulse" />
const SkeletonKpi = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
    ))}
  </div>
)

export function TransactionsContent({ query = { currency: 'ARS', secondary: 'none' } }: TransactionsContentProps) {
  const t = useTranslations('transactions')
  const queryClient = useQueryClient()
  const [q] = useQueryState('q', { defaultValue: '' })
  const [category] = useQueryState('categories', { defaultValue: '' })
  const [accountCbu] = useQueryState('accounts', { defaultValue: '' })
  const [method] = useQueryState('method', { defaultValue: '' })
  const [pageState, setPageState] = useQueryState('page', parseAsInteger.withDefault(1))

  const categoryId = category && category !== 'none' ? parseInt(category, 10) : undefined

  const { data, isLoading, refetch } = useTransactionsPage({
    currency: query.currency,
    secondary: query.secondary,
    q,
    categoryId,
    accountCbu,
    method,
    page: pageState,
  })

  const [selection, setSelection] = useState<RowSelectionState>({})
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)

  const summary = data?.summary
  const pageSection = data?.page
  const filterOptionsSection = data?.filterOptions
  const uncategorised = data?.uncategorised

  const items = pageSection?.data?.rows ?? []
  const totalPages = pageSection?.data?.totalPages ?? 1
  const filterOptions = filterOptionsSection?.data ?? undefined
  const bulkCategories = (filterOptions?.categories ?? []).flatMap((c) =>
    c.id != null && c.name != null ? [{ id: c.id, name: c.name }] : []
  )

  const selectedCount = Object.keys(selection).length

  const handleBulkCategorise = async (catId: number) => {
    await queryClient.invalidateQueries({ queryKey: ['bff', 'transactions'] })
    setSelection({})
  }

  const observedAt = pageSection?.observedAt || summary?.observedAt

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        {observedAt && <FreshnessStamp observedAt={observedAt} />}
      </div>

      <SectionState section={uncategorised} isLoading={isLoading} skeleton={<SkeletonBanner />} onRetry={refetch}>
        {(u) => <UncategorisedBanner count={u.count ?? 0} />}
      </SectionState>

      <SectionState section={summary} isLoading={isLoading} skeleton={<SkeletonKpi />} onRetry={refetch}>
        {(s) => (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">{t('summary.income')}</p>
              <p className="text-xl font-bold tracking-tight mt-1" data-testid="tx-summary-income">
                <Money value={s.income} tone="gain" />
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">{t('summary.expense')}</p>
              <p className="text-xl font-bold tracking-tight mt-1" data-testid="tx-summary-expense">
                <Money value={s.expense} tone="loss" />
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">{t('summary.net')}</p>
              <p className="text-xl font-bold tracking-tight mt-1" data-testid="tx-summary-net">
                <Money value={s.net} tone="neutral" />
              </p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-card-foreground shadow-sm">
              <p className="text-xs font-medium text-muted-foreground">{t('summary.count')}</p>
              <p className="text-xl font-bold tracking-tight mt-1" data-testid="tx-summary-count">
                {s.count ?? 0}
              </p>
            </div>
          </div>
        )}
      </SectionState>

      <TransactionFilters options={filterOptions} />

      <SectionState
        section={pageSection}
        isLoading={isLoading}
        onRetry={refetch}
        skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
      >
        {() => (
          <div className="space-y-4">
            <TransactionTable
              rows={items}
              selection={selection}
              onSelectionChange={setSelection}
              onRowClick={(row) => setSelectedRowId(row.id ?? null)}
            />

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <Pagination page={pageState} totalPages={totalPages} onChange={(p) => setPageState(p)} />
              <BulkCategoriseBar
                count={selectedCount}
                categories={bulkCategories}
                onCategorise={handleBulkCategorise}
                onClear={() => setSelection({})}
              />
            </div>
          </div>
        )}
      </SectionState>

      <TransactionDetailPanel selectedId={selectedRowId} onClose={() => setSelectedRowId(null)} />
    </div>
  )
}
