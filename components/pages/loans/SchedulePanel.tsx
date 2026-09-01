'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SidePanel } from '@/components/ui-kit/overlay/SidePanel'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { ScrollTable } from '@/components/ui-kit/table/ScrollTable'
import { StatusDot } from '@/components/ui-kit/row/StatusDot'
import { Money } from '@/components/ui-kit/money/Money'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/format'
import { useLoanSchedule } from '@/lib/hooks/useLoanSchedule'
import { PayInstallmentDialog } from './PayInstallmentDialog'
import type {
  AccountOption,
  BffQuery,
  InstallmentRow,
  LoanDetailRow,
  Section,
} from '@/lib/api/bff/types'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'

const ABSENT = '—'

export interface SchedulePanelProps {
  loan: LoanDetailRow | null
  query?: BffQuery
  accounts?: Section<AccountOption[]>
  accountsLoading: boolean
  onClose: () => void
  onRetryAccounts?: () => void
}

export function SchedulePanel({
  loan,
  query,
  accounts,
  accountsLoading,
  onClose,
  onRetryAccounts,
}: SchedulePanelProps) {
  const t = useTranslations('loans')
  const tc = useTranslations('common')
  // `id` is optional on the wire; the hook's `enabled: id > 0` gate keeps 0 idle.
  const loanId = loan?.id ?? 0
  const { data, isLoading, refetch } = useLoanSchedule(loanId, query)
  const [payTarget, setPayTarget] = React.useState<InstallmentRow | null>(null)

  React.useEffect(() => {
    setPayTarget(null)
  }, [loanId])

  const columns: ColumnDef<InstallmentRow, unknown>[] = [
    {
      id: 'number',
      header: t('schedule.number'),
      cell: ({ row }) => <span className="n">{row.original.number ?? ABSENT}</span>,
    },
    {
      id: 'amount',
      header: t('schedule.amount'),
      cell: ({ row }) => <Money value={row.original.amount} />,
    },
    {
      id: 'dueDate',
      header: t('schedule.dueDate'),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <span className="n">
            {row.original.dueDate ? formatDate(row.original.dueDate) : ABSENT}
          </span>
          <StatusDot
            tone={row.original.paid ? 'ok' : 'neutral'}
            label={row.original.paid ? t('schedule.paid') : t('schedule.pending')}
          />
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{tc('rowActions')}</span>,
      cell: ({ row }) =>
        row.original.paid ? null : (
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setPayTarget(row.original)}>
              {t('schedule.pay')}
            </Button>
          </div>
        ),
    },
  ]

  return (
    <SidePanel open={loan !== null} onClose={onClose} title={t('schedule.title')}>
      <SectionState
        section={data?.installments}
        isLoading={isLoading}
        onRetry={refetch}
        skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
      >
        {(installments) => (
          <ScrollTable columns={columns} rows={installments} caption={t('schedule.title')} />
        )}
      </SectionState>

      <PayInstallmentDialog
        open={payTarget !== null}
        onOpenChange={(open) => {
          if (!open) setPayTarget(null)
        }}
        loanId={loan?.id}
        installmentId={payTarget?.id}
        accounts={accounts}
        accountsLoading={accountsLoading}
        onRetry={onRetryAccounts}
      />
    </SidePanel>
  )
}
