'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
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

const LOAN_COLUMN_KEYS = {
  label: 'loans.columnLabel',
  outstanding: 'loans.columnOutstanding',
  installments: 'loans.columnInstallments',
  nextInstallmentDate: 'loans.columnNextDue',
} as const

export function LoansTab({ section, isLoading, onRetry }: LoansTabProps) {
  const t = useTranslations('banks')
  const tc = useTranslations('common')

  const loanColumns: ColumnDef<LoanRow, unknown>[] = [
    {
      id: 'label',
      accessorKey: 'label',
      header: t(LOAN_COLUMN_KEYS.label),
    },
    {
      id: 'outstanding',
      accessorFn: (row) => row.outstanding,
      header: t(LOAN_COLUMN_KEYS.outstanding),
      cell: ({ getValue }) => <Money value={getValue() as any} />,
    },
    {
      id: 'installments',
      accessorFn: (row) =>
        t('loans.installmentsOfTotal', {
          paid: row.installmentsPaid ?? 0,
          total: row.installmentsTotal ?? 0,
        }),
      header: t(LOAN_COLUMN_KEYS.installments),
    },
    {
      id: 'nextInstallmentDate',
      accessorKey: 'nextInstallmentDate',
      header: t(LOAN_COLUMN_KEYS.nextInstallmentDate),
    },
  ]

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
            <h3 className="section-head font-medium">{t('loans.activeTitle')}</h3>
            <Link href="/loans">
              <Button variant="ghost" size="sm">
                {tc('seeAll')} →
              </Button>
            </Link>
          </div>
          <ScrollTable columns={loanColumns} rows={loans} caption={t('loans.tableCaption')} maxHeight={300} />
        </div>
      )}
    </SectionState>
  )
}
