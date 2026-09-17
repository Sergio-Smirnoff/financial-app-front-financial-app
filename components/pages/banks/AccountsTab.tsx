'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { AccountCard } from '@/components/ui-kit/page/banks/AccountCard'
import { RowActions } from '@/components/ui-kit/controls/FilterBar'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import type { Section, AccountRow } from '@/lib/api/bff/types'

export interface AccountsTabProps {
  section?: Section<AccountRow[]>
  isLoading: boolean
  onRetry?: () => void
  onAddAccount?: () => void
  onDeposit?: (account: AccountRow) => void
  onWithdraw?: (account: AccountRow) => void
  onTransfer?: (account: AccountRow) => void
  onHistory?: (account: AccountRow) => void
  onDelete?: (account: AccountRow) => void
}

export function AccountsTab({
  section,
  isLoading,
  onRetry,
  onAddAccount,
  onDeposit,
  onWithdraw,
  onTransfer,
  onHistory,
  onDelete,
}: AccountsTabProps) {
  const t = useTranslations('banks')
  const tc = useTranslations('common')

  return (
    <div className="space-y-4">
      {onAddAccount && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            {section?.data ? `${section.data.length} ${t('tabAccounts').toLowerCase()}` : ''}
          </p>
          <Button size="sm" onClick={onAddAccount} className="gap-1.5 font-semibold">
            <Plus className="h-4 w-4" />
            {t('accounts.add')}
          </Button>
        </div>
      )}

      <SectionState
        section={section}
        isLoading={isLoading}
        onRetry={onRetry}
        emptyAction={
          onAddAccount ? (
            <Button size="sm" onClick={onAddAccount}>
              {t('accounts.add')}
            </Button>
          ) : undefined
        }
        skeleton={
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        {(accounts) => (
          <div className="grid gap-4 md:grid-cols-2">
            {accounts.map((acc) => (
              <AccountCard
                key={acc.cbu || acc.alias || acc.bankName}
                account={{
                  id: acc.cbu || acc.alias || '',
                  name: acc.alias || acc.type || t('accounts.fallbackName'),
                  bank: acc.bankName || t('accounts.fallbackBank'),
                  cbu: acc.cbu,
                  alias: acc.alias,
                  currency: acc.balance?.currency || 'ARS',
                  balance: acc.balance || { amount: '0', currency: 'ARS', secondary: null },
                }}
                actions={
                  <RowActions
                    items={[
                      { label: t('dialogs.record.title.DEPOSIT'), onSelect: () => onDeposit?.(acc) },
                      { label: t('dialogs.record.title.WITHDRAW'), onSelect: () => onWithdraw?.(acc) },
                      { label: t('dialogs.record.title.TRANSFER'), onSelect: () => onTransfer?.(acc) },
                      { label: tc('seeAll'), onSelect: () => onHistory?.(acc) },
                      { label: tc('delete'), onSelect: () => onDelete?.(acc), tone: 'destructive' },
                    ]}
                  />
                }
              />
            ))}
          </div>
        )}
      </SectionState>
    </div>
  )
}
