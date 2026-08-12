'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { AccountCard } from '@/components/ui-kit/page/banks/AccountCard'
import { Button } from '@/components/ui/button'
import type { Section, AccountRow } from '@/lib/api/bff/types'

export interface AccountsTabProps {
  section?: Section<AccountRow[]>
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
                name: acc.alias || acc.type || 'Cuenta',
                bank: acc.bankName || 'Banco',
                cbu: acc.cbu,
                alias: acc.alias,
                currency: acc.balance?.currency || 'ARS',
                balance: acc.balance || { amount: '0', currency: 'ARS', secondary: null },
              }}
            />
          ))}
        </div>
      )}
    </SectionState>
  )
}
