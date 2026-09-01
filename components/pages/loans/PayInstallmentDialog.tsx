'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Dialog } from '@/components/ui-kit/overlay/Dialog'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { Button } from '@/components/ui/button'
import { usePayLoanInstallment } from '@/lib/hooks/useLoans'
import type { AccountOption, Section } from '@/lib/api/bff/types'

export interface PayInstallmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  loanId?: number
  installmentId?: number
  accounts?: Section<AccountOption[]>
  accountsLoading: boolean
  onRetry?: () => void
}

export function PayInstallmentDialog({
  open,
  onOpenChange,
  loanId,
  installmentId,
  accounts,
  accountsLoading,
  onRetry,
}: PayInstallmentDialogProps) {
  const t = useTranslations('loans')
  const tc = useTranslations('common')
  const pay = usePayLoanInstallment()
  const [accountCbu, setAccountCbu] = React.useState('')

  React.useEffect(() => {
    if (!open) setAccountCbu('')
  }, [open])

  const payable = loanId != null && installmentId != null && accountCbu !== ''

  const handleConfirm = async () => {
    if (loanId == null || installmentId == null || accountCbu === '') return
    await pay.mutateAsync({ loanId, installmentId, accountCbu })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('payDialog.title')}
      description={t('payDialog.description')}
    >
      <SectionState
        section={accounts}
        isLoading={accountsLoading}
        onRetry={onRetry}
        skeleton={<div className="h-20 rounded-lg bg-muted animate-pulse" />}
      >
        {(options) => (
          <fieldset className="space-y-2">
            <legend className="pb-2 text-sm font-medium">{t('payDialog.account')}</legend>
            {options.map((option) => {
              const cbu = option.cbu
              if (!cbu) return null
              return (
                <label key={cbu} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="pay-from-account"
                    value={cbu}
                    checked={accountCbu === cbu}
                    onChange={() => setAccountCbu(cbu)}
                  />
                  <span className="n">{option.alias ?? cbu}</span>
                </label>
              )
            })}
          </fieldset>
        )}
      </SectionState>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {tc('cancel')}
        </Button>
        <Button onClick={handleConfirm} disabled={!payable || pay.isPending}>
          {t('payDialog.confirm')}
        </Button>
      </div>
    </Dialog>
  )
}
