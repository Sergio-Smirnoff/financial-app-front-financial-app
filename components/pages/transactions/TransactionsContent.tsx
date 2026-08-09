'use client'

import React, { useState } from 'react'
import { useQueryState, useQueryStates, parseAsInteger } from 'nuqs'
import { useTransactionsPage } from '@/lib/hooks/useTransactionsPage'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { Pagination } from '@/components/ui-kit/table/Pagination'
import { TransactionFilters } from './TransactionFilters'
import { TransactionTable } from './TransactionTable'
import { UncategorisedBanner } from './UncategorisedBanner'
import { BulkCategoriseBar } from './BulkCategoriseBar'
import { TransactionDetailPanel } from './TransactionDetailPanel'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import { useQueryClient } from '@tanstack/react-query'
import type { BffQuery, TransactionRow } from '@/lib/api/bff/types'
import type { RowSelectionState } from '@tanstack/react-table'

export interface TransactionsContentProps {
  query?: BffQuery
}

export function TransactionsContent({ query = { currency: 'ARS', secondary: 'none' } }: TransactionsContentProps) {
  const queryClient = useQueryClient()
  const [q] = useQueryState('q', { defaultValue: '' })
  const [category] = useQueryState('categories', { defaultValue: '' })
  const [accountCbu] = useQueryState('accounts', { defaultValue: '' })
  const [pageState, setPageState] = useQueryState('page', parseAsInteger.withDefault(1))

  const categoryId = category && category !== 'none' ? parseInt(category, 10) : undefined

  const { data, isLoading, refetch } = useTransactionsPage({
    currency: query.currency,
    secondary: query.secondary,
    q,
    categoryId,
    accountCbu,
    page: pageState,
  })

  const [selection, setSelection] = useState<RowSelectionState>({})
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null)

  const filterOptions = data?.filters?.data
  const movementsSection = data?.movements
  const items = movementsSection?.data?.items ?? []
  const totalPages = movementsSection?.data?.totalPages ?? 1

  const uncategorisedCount = items.filter((i) => !i.categoryId).length
  const selectedCount = Object.keys(selection).length

  const handleBulkCategorise = async (catId: number) => {
    await queryClient.invalidateQueries({ queryKey: ['bff', 'transactions'] })
    setSelection({})
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Movimientos</h1>
          <p className="text-sm text-muted-foreground">Historial de ingresos, egresos y categorización</p>
        </div>
        {movementsSection?.observedAt && <FreshnessStamp observedAt={movementsSection.observedAt} />}
      </div>

      <UncategorisedBanner count={uncategorisedCount} />

      <TransactionFilters options={filterOptions} />

      <SectionState
        section={movementsSection}
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
              onRowClick={(row) => setSelectedRowId(row.id)}
            />

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <Pagination page={pageState} totalPages={totalPages} onChange={(p) => setPageState(p)} />
              <BulkCategoriseBar
                count={selectedCount}
                categories={filterOptions?.categories ?? []}
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
