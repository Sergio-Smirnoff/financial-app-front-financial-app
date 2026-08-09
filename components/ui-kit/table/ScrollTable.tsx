'use client'

import {
  useLegacyTable as useReactTable,
  getCoreRowModel,
  type LegacyColumnDef as ColumnDef,
} from '@tanstack/react-table/legacy'
import { flexRender } from '@tanstack/react-table/flex-render'
import { cn } from '@/lib/utils'

export interface ScrollTableProps<T extends Record<string, any> = any> {
  columns: ColumnDef<T, unknown>[]
  rows: T[]
  maxHeight?: number
  caption: string
  className?: string
}

export function ScrollTable<T extends Record<string, any> = any>({
  columns,
  rows,
  maxHeight = 400,
  caption,
  className,
}: ScrollTableProps<T>) {
  const table = useReactTable<T>({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, index) => {
      const r = row as Record<string, unknown>
      return String(r['id'] ?? index)
    },
  })

  return (
    <div
      className={cn('w-full overflow-auto', className)}
      style={{ maxHeight }}
    >
      <table aria-label={caption} className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 z-10 bg-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b transition-colors hover:bg-muted/30">
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
