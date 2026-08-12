'use client'

import React from 'react'
import { DataTable } from '@/components/ui-kit/table/DataTable'
import { Money } from '@/components/ui-kit/money/Money'
import type { TransactionRow } from '@/lib/api/bff/types'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import type { RowSelectionState, SortingState, OnChangeFn } from '@tanstack/react-table'

export interface TransactionTableProps {
  rows: TransactionRow[]
  selection?: RowSelectionState
  onSelectionChange?: OnChangeFn<RowSelectionState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  onRowClick?: (row: TransactionRow) => void
}

const columns: ColumnDef<TransactionRow, unknown>[] = [
  {
    id: 'date',
    accessorKey: 'date',
    header: 'Fecha',
    enableSorting: true,
    cell: ({ getValue }) => <span data-testid="tx-row">{String(getValue() ?? '')}</span>,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Descripción',
    enableSorting: true,
  },
  {
    id: 'account',
    accessorFn: (row) => row.accountAlias || row.accountCbu || '–',
    header: 'Cuenta',
  },
  {
    id: 'category',
    accessorFn: (row) => row.categoryName || 'Sin categorizar',
    header: 'Categoría',
  },
  {
    id: 'method',
    accessorFn: (row) => row.method || 'Débito automático',
    header: 'Método',
  },
  {
    id: 'amount',
    accessorFn: (row) => row,
    header: 'Importe',
    cell: ({ getValue }) => {
      const row = getValue() as TransactionRow
      return <Money value={row.amount} tone={row.direction === 'IN' ? 'gain' : 'loss'} />
    },
  },
]

export function TransactionTable({
  rows,
  selection,
  onSelectionChange,
  sorting,
  onSortingChange,
  onRowClick,
}: TransactionTableProps) {
  return (
    <DataTable
      columns={columns}
      rows={rows}
      caption="Tabla de movimientos"
      selection={selection}
      onSelectionChange={onSelectionChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      onRowClick={onRowClick}
    />
  )
}
