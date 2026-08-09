'use client'

import React from 'react'
import Link from 'next/link'
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

const columns: ColumnDef<TransactionRow, unknown>[] = [
  {
    id: 'date',
    accessorKey: 'date',
    header: 'Fecha',
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: 'Descripción',
  },
  {
    id: 'category',
    accessorFn: (row) => row.categoryName || 'Sin categoría',
    header: 'Categoría',
  },
  {
    id: 'amount',
    accessorFn: (row) => row,
    header: 'Monto',
    cell: ({ getValue }) => {
      const row = getValue() as TransactionRow
      return <Money value={row.amount} tone={row.direction === 'IN' ? 'gain' : 'loss'} />
    },
  },
]

export function LatestMovementsCard({ section, isLoading, onRetry }: LatestMovementsCardProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      emptyAction={
        <Link href="/transactions">
          <Button size="sm">Registrar movimiento</Button>
        </Link>
      }
      skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
    >
      {(data) => (
        <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="section-head">Últimos Movimientos</h3>
            <Link href="/transactions" className="text-xs font-medium text-primary hover:underline">
              Ver todos →
            </Link>
          </div>
          <ScrollTable columns={columns} rows={data} caption="Últimos movimientos" maxHeight={320} />
        </div>
      )}
    </SectionState>
  )
}
