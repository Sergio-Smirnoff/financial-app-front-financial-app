'use client'

import React from 'react'
import { useTranslations, useFormatter } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { ScrollTable } from '@/components/ui-kit/table/ScrollTable'
import { RowActions } from '@/components/ui-kit/controls/FilterBar'
import { Money } from '@/components/ui-kit/money/Money'
import { formatDate } from '@/lib/format'
import type { Section, LoanDetailRow } from '@/lib/api/bff/types'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'

const ABSENT = '—'

export interface LoanTableProps {
  section?: Section<LoanDetailRow[]>
  isLoading: boolean
  onRetry?: () => void
  onViewSchedule: (loan: LoanDetailRow) => void
  onDelete: (loan: LoanDetailRow) => void
}

export function LoanTable({
  section,
  isLoading,
  onRetry,
  onViewSchedule,
  onDelete,
}: LoanTableProps) {
  const t = useTranslations('loans')
  const tc = useTranslations('common')
  const format = useFormatter()

  const columns: ColumnDef<LoanDetailRow, unknown>[] = [
    {
      id: 'loan',
      header: t('table.loan'),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.label ?? ABSENT}</span>
          {row.original.installmentsTotal != null && (
            <span className="text-xs text-muted-foreground">
              {t('table.progress', {
                paid: row.original.installmentsPaid ?? 0,
                total: row.original.installmentsTotal,
              })}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'bank',
      header: t('table.bank'),
      cell: ({ row }) => <span className="n">{row.original.bankNumber ?? ABSENT}</span>,
    },
    {
      id: 'principal',
      header: t('table.principal'),
      cell: ({ row }) => <Money value={row.original.principal} />,
    },
    {
      id: 'outstanding',
      header: t('table.outstanding'),
      cell: ({ row }) => <Money value={row.original.outstanding} />,
    },
    {
      id: 'rate',
      header: t('table.rate'),
      cell: ({ row }) => (
        <span className="n">
          {row.original.interestRate == null
            ? ABSENT
            : `${format.number(row.original.interestRate, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}%`}
        </span>
      ),
    },
    {
      id: 'nextInstallment',
      header: t('table.nextInstallment'),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Money value={row.original.nextInstallmentAmount} />
          {row.original.nextInstallmentDate && (
            <span className="text-xs text-muted-foreground">
              {formatDate(row.original.nextInstallmentDate)}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{tc('rowActions')}</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <RowActions
            items={[
              { label: t('table.viewSchedule'), onSelect: () => onViewSchedule(row.original) },
              { label: tc('delete'), onSelect: () => onDelete(row.original), tone: 'destructive' },
            ]}
          />
        </div>
      ),
    },
  ]

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      emptyTitle={t('table.empty')}
      emptyTestId="loans-table-empty"
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
    >
      {(loans) => <ScrollTable columns={columns} rows={loans} caption={t('title')} />}
    </SectionState>
  )
}
