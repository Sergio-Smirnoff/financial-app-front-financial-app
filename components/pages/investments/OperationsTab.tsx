'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { ScrollTable } from '@/components/ui-kit/table/ScrollTable'
import { Money } from '@/components/ui-kit/money/Money'
import { formatQuantity } from '@/lib/format'
import type { MoneyView, Section } from '@/lib/api/bff/types'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'

export interface OperationRow {
  holdingId?: number
  ticker?: string
  kind?: string
  date?: string
  quantity?: number
  amount?: MoneyView | null
}

export interface OperationsTabProps {
  section?: Section<OperationRow[]>
  isLoading: boolean
  onRetry?: () => void
}

const OPERATION_COLUMN_KEYS = {
  date: 'operations.colDate',
  kind: 'operations.colKind',
  amount: 'operations.colAmount',
} as const

const COMMON_COLUMN_KEYS = {
  ticker: 'ticker',
  quantity: 'quantity',
} as const

export function OperationsTab({ section, isLoading, onRetry }: OperationsTabProps) {
  const t = useTranslations('investments')
  const tc = useTranslations('common')

  const columns: ColumnDef<OperationRow, unknown>[] = [
    {
      id: 'date',
      accessorKey: 'date',
      header: t(OPERATION_COLUMN_KEYS.date),
    },
    {
      id: 'kind',
      accessorKey: 'kind',
      header: t(OPERATION_COLUMN_KEYS.kind),
      cell: ({ getValue }) => {
        const kind = getValue() as string
        const isBuy = kind?.toLowerCase().includes('compra') || kind?.toLowerCase().includes('buy')
        return (
          <span className={`font-semibold text-xs px-2 py-0.5 rounded ${isBuy ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
            {kind}
          </span>
        )
      },
    },
    {
      id: 'ticker',
      accessorKey: 'ticker',
      header: tc(COMMON_COLUMN_KEYS.ticker),
      cell: ({ row }) => (
        <span className="flex flex-col">
          <span className="font-mono font-semibold">{row.original.ticker}</span>
          <small className="text-[11px] text-muted-foreground md:hidden">{row.original.date}</small>
        </span>
      ),
    },
    {
      id: 'quantity',
      accessorKey: 'quantity',
      header: tc(COMMON_COLUMN_KEYS.quantity),
      cell: ({ row }) => formatQuantity(row.original.quantity),
    },
    {
      id: 'amount',
      accessorFn: (row) => row.amount,
      header: t(OPERATION_COLUMN_KEYS.amount),
      cell: ({ row }) => (
        <span className="flex flex-col items-end">
          <Money value={row.original.amount} />
          {row.original.quantity != null && (
            <small className="text-[11px] text-muted-foreground md:hidden">
              {formatQuantity(row.original.quantity)} {tc('units')}
            </small>
          )}
        </span>
      ),
    },
  ]

  const columnClassNames = {
    date: 'max-md:hidden',
    quantity: 'max-md:hidden',
    amount: 'whitespace-nowrap text-right',
  } as const

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
      emptyTitle={t('operations.empty')}
      emptyTestId="operations-empty"
    >
      {(operations) => (
        <div className="elev-sm rounded-xl border bg-card p-5 flex h-full min-h-0 flex-col gap-4 max-md:p-3.5 short:gap-2 short:p-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="section-head">{t('operations.heading')}</h3>
            <p className="text-xs text-muted-foreground max-md:hidden">{t('operations.subheading')}</p>
          </div>
          <ScrollTable
            columns={columns}
            rows={operations}
            caption={t('operations.caption')}
            maxHeight={350}
            columnClassNames={columnClassNames}
            className="max-md:max-h-none frame:max-h-none frame:min-h-0 frame:flex-1"
          />
        </div>
      )}
    </SectionState>
  )
}
