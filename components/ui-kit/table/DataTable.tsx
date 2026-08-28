'use client'

import type { SortingState, RowSelectionState, OnChangeFn } from '@tanstack/react-table'
import {
  useLegacyTable as useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type LegacyColumnDef as ColumnDef,
} from '@tanstack/react-table/legacy'
import { flexRender } from '@tanstack/react-table/flex-render'
import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

export interface DataTableProps<T extends Record<string, any> = any> {
  columns: ColumnDef<T, unknown>[]
  rows: T[]
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  selection?: RowSelectionState
  onSelectionChange?: OnChangeFn<RowSelectionState>
  onRowClick?: (row: T) => void
  caption: string
  className?: string
}

export function DataTable<T extends Record<string, any> = any>({
  columns,
  rows,
  sorting: sortingProp,
  onSortingChange,
  selection: selectionProp,
  onSelectionChange,
  onRowClick,
  caption,
  className,
}: DataTableProps<T>) {
  const t = useTranslations('common')
  const [internalSorting, setInternalSorting] = useState<SortingState>([])
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({})

  const sorting = sortingProp ?? internalSorting
  const setSorting = onSortingChange ?? setInternalSorting
  const rowSelection = selectionProp ?? internalSelection
  const setRowSelection = onSelectionChange ?? setInternalSelection

  const selectionColumn: ColumnDef<T, unknown> = {
    id: '__select',
    header: ({ table }) => (
      <input
        type="checkbox"
        aria-label={t('selectAllRows')}
        checked={table.getIsAllRowsSelected()}
        ref={(el) => {
          if (el) el.indeterminate = table.getIsSomeRowsSelected()
        }}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label={t('selectRow', { row: row.index + 1 })}
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        onClick={(e) => e.stopPropagation()}
      />
    ),
    size: 40,
    enableSorting: false,
  }

  const hasSelection = selectionProp !== undefined || onSelectionChange !== undefined
  const allColumns: ColumnDef<T, unknown>[] = hasSelection
    ? [selectionColumn, ...columns]
    : columns

  const table = useReactTable<T>({
    data: rows,
    columns: allColumns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row, index) => {
      const r = row as Record<string, unknown>
      return String(r['id'] ?? index)
    },
  })

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table aria-label={caption} className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b">
              {headerGroup.headers.map((header) => {
                const isSortable = header.column.getCanSort()
                const sortDirection = header.column.getIsSorted()
                const ariaSort = isSortable
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : sortDirection === 'desc'
                      ? 'descending'
                      : 'none'
                  : undefined

                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={ariaSort}
                    className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap"
                  >
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sortDirection === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : sortDirection === 'desc' ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className={cn(
                'border-b transition-colors hover:bg-muted/30',
                onRowClick && 'cursor-pointer',
                row.getIsSelected() && 'bg-primary/5'
              )}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
