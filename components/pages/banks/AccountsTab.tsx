'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { AccountCard } from '@/components/ui-kit/page/banks/AccountCard'
import { Button } from '@/components/ui/button'
import type { Section, BankAccountRow } from '@/lib/api/bff/types'

export interface AccountsTabProps {
  section?: Section<BankAccountRow[]>
  isLoading: boolean
  onRetry?: () => void
  onAddAccount?: () => void
}

export function AccountsTab({ section, isLoading, onRetry, onAddAccount }: AccountsTabProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      emptyAction={
        onAddAccount ? (
          <Button size="sm" onClick={onAddAccount}>
            Agregar cuenta
          </Button>
        ) : undefined
      }
      skeleton={<div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />))}</div>}
    >
      {(accounts) => (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.map((acc) => (
            <AccountCard
              key={acc.id}
              account={{
                id: String(acc.id),
                name: acc.alias || acc.accountType,
                bankName: acc.bankName,
                accountNumber: acc.cbu,
                balance: acc.balance,
                currency: acc.balance.currency,
              }}
            />
          ))}
        </div>
      )}
    </SectionState>
  )
}
