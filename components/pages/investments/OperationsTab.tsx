'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { ScrollTable } from '@/components/ui-kit/table/ScrollTable'
import { Money } from '@/components/ui-kit/money/Money'
import type { Section } from '@/lib/api/bff/types'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'

export interface OperationRow {
  holdingId?: number
  ticker?: string
  kind?: string
  date?: string
  quantity?: number
  amount?: any
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
    },
    {
      id: 'quantity',
      accessorKey: 'quantity',
      header: tc(COMMON_COLUMN_KEYS.quantity),
    },
    {
      id: 'amount',
      accessorFn: (row) => row.amount,
      header: t(OPERATION_COLUMN_KEYS.amount),
      cell: ({ getValue }) => <Money value={getValue() as any} />,
    },
  ]

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
    >
      {(operations) => (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="section-head">{t('operations.heading')}</h3>
            <p className="text-xs text-muted-foreground">{t('operations.subheading')}</p>
          </div>
          {operations.length === 0 ? (
            <div data-testid="operations-empty" className="text-center py-8">
              <p className="text-sm text-muted-foreground">{t('operations.empty')}</p>
            </div>
          ) : (
            <ScrollTable columns={columns} rows={operations} caption={t('operations.caption')} maxHeight={350} />
          )}
        </div>
      )}
    </SectionState>
  )
}
