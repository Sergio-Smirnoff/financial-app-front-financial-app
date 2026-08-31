'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { DataTable } from '@/components/ui-kit/table/DataTable'
import { Money } from '@/components/ui-kit/money/Money'
import type { TransactionRow } from '@/lib/api/bff/types'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import type { RowSelectionState, SortingState, OnChangeFn } from '@tanstack/react-table'
import { formatPaymentMethod } from '@/lib/format'

export interface TransactionTableProps {
  rows: TransactionRow[]
  selection?: RowSelectionState
  onSelectionChange?: OnChangeFn<RowSelectionState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  onRowClick?: (row: TransactionRow) => void
}

export function TransactionTable({
  rows,
  selection,
  onSelectionChange,
  sorting,
  onSortingChange,
  onRowClick,
}: TransactionTableProps) {
  const t = useTranslations('transactions')

  const columns: ColumnDef<TransactionRow, unknown>[] = React.useMemo(
    () => [
      {
        id: 'date',
        accessorKey: 'date',
        header: t('table.date'),
        enableSorting: true,
        cell: ({ getValue }) => <span data-testid="tx-row">{String(getValue() ?? '')}</span>,
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: t('table.description'),
        enableSorting: true,
      },
      {
        id: 'account',
        accessorFn: (row) => row.accountAlias || row.accountCbu || '–',
        header: t('table.account'),
      },
      {
        id: 'category',
        accessorFn: (row) => row.categoryName || t('uncategorisedValue'),
        header: t('table.category'),
      },
      {
        id: 'method',
        accessorFn: (row) => formatPaymentMethod(row.method),
        header: t('method'),
      },
      {
        id: 'amount',
        accessorFn: (row) => row,
        header: t('table.amount'),
        cell: ({ getValue }) => {
          const row = getValue() as TransactionRow
          return <Money value={row.amount} tone={row.direction === 'IN' ? 'gain' : 'loss'} />
        },
      },
    ],
    [t],
  )

  return (
    <DataTable
      columns={columns}
      rows={rows}
      caption={t('table.caption')}
      selection={selection}
      onSelectionChange={onSelectionChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      onRowClick={onRowClick}
    />
  )
}
