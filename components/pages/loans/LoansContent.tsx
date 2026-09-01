'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useBffQuery } from '@/lib/hooks/useBffQuery'
import { useLoansPage } from '@/lib/hooks/useLoansPage'
import { useDeleteLoan } from '@/lib/hooks/useLoans'
import { Dialog } from '@/components/ui-kit/overlay/Dialog'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import { Button } from '@/components/ui/button'
import { LoanKpis } from './LoanKpis'
import { LoanTable } from './LoanTable'
import { SchedulePanel } from './SchedulePanel'
import type { LoanDetailRow } from '@/lib/api/bff/types'

export function LoansContent() {
  const t = useTranslations('loans')
  const tc = useTranslations('common')
  const query = useBffQuery()
  const { data, isLoading, refetch } = useLoansPage(query)
  const deleteLoan = useDeleteLoan()

  const [scheduleLoan, setScheduleLoan] = React.useState<LoanDetailRow | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<LoanDetailRow | null>(null)

  const observedAt = data?.kpis?.observedAt

  const handleConfirmDelete = async () => {
    // `id` is optional on the wire: without one there is nothing to delete.
    const id = deleteTarget?.id
    if (id == null) return
    await deleteLoan.mutateAsync(id)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        {observedAt && <FreshnessStamp observedAt={observedAt} />}
      </div>

      <LoanKpis section={data?.kpis} isLoading={isLoading} onRetry={refetch} />

      <LoanTable
        section={data?.loans}
        isLoading={isLoading}
        onRetry={refetch}
        onViewSchedule={setScheduleLoan}
        onDelete={setDeleteTarget}
      />

      <SchedulePanel
        loan={scheduleLoan}
        query={query}
        accounts={data?.payFromAccounts}
        accountsLoading={isLoading}
        onClose={() => setScheduleLoan(null)}
        onRetryAccounts={refetch}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title={t('deleteDialog.title')}
        description={t('deleteDialog.body', { label: deleteTarget?.label ?? t('table.loan') })}
        tone="destructive"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>
            {tc('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={deleteLoan.isPending}
          >
            {tc('delete')}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
