'use client'

import React from 'react'
import Link from 'next/link'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { ScrollTable } from '@/components/ui-kit/table/ScrollTable'
import { Money } from '@/components/ui-kit/money/Money'
import { Button } from '@/components/ui/button'
import type { Section, LoanRow } from '@/lib/api/bff/types'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'

export interface LoansTabProps {
  section?: Section<LoanRow[]>
  isLoading: boolean
  onRetry?: () => void
}

const loanColumns: ColumnDef<LoanRow, unknown>[] = [
  {
    id: 'lender',
    accessorKey: 'lender',
    header: 'Prestamista / Entidad',
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: 'Préstamo',
  },
  {
    id: 'remainingAmount',
    accessorFn: (row) => row.remainingAmount,
    header: 'Saldo Pendiente',
    cell: ({ getValue }) => <Money value={getValue() as any} />,
  },
  {
    id: 'installmentsLeft',
    accessorFn: (row) => `${row.installmentsLeft} cuotas`,
    header: 'Cuotas Restantes',
  },
  {
    id: 'nextDueDate',
    accessorKey: 'nextDueDate',
    header: 'Próximo Vencimiento',
  },
]

export function LoansTab({ section, isLoading, onRetry }: LoansTabProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
    >
      {(loans) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="section-head font-medium">Préstamos Activos</h3>
            <Link href="/loans">
              <Button variant="ghost" size="sm">
                Ver todo →
              </Button>
            </Link>
          </div>
          <ScrollTable columns={loanColumns} rows={loans} caption="Resumen de préstamos" maxHeight={300} />
        </div>
      )}
    </SectionState>
  )
}
