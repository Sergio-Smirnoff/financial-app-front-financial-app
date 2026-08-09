'use client'

import React, { useState } from 'react'
import { useQueryState } from 'nuqs'
import { useBanksPage } from '@/lib/hooks/useBanksPage'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SplitLayout, RailSection } from '@/components/ui-kit/layout/KpiStrip'
import { AccountsTab } from './AccountsTab'
import { CardsTab } from './CardsTab'
import { LoansTab } from './LoansTab'
import { ImportHealthRail } from './ImportHealthRail'
import { CashDistributionCard } from './CashDistributionCard'
import { PaymentCalendarCard } from './PaymentCalendarCard'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import { AddAccountDialog } from './AddAccountDialog'
import { CardFormDialog } from './CardFormDialog'
import type { BffQuery, BanksBff } from '@/lib/api/bff/types'

export interface BanksContentProps {
  query?: BffQuery
  initialData?: BanksBff
}

export function BanksContent({ query = { currency: 'ARS', secondary: 'none' } }: BanksContentProps) {
  const [tab, setTab] = useQueryState('tab', { defaultValue: 'accounts' })
  const { data, isLoading, refetch } = useBanksPage(query)

  const [addAccountOpen, setAddAccountOpen] = useState(false)
  const [addCardOpen, setAddCardOpen] = useState(false)

  const summary = data?.summary
  const accountsData = data?.accounts
  const cardsData = data?.cards
  const loansData = data?.loans

  const importHealthItems = accountsData?.data?.map((acc) => ({
    id: String(acc.id),
    accountName: acc.alias || `${acc.bankName} ${acc.accountType}`,
    status: (acc.lastSync ? 'FRESH' : 'NEVER') as 'FRESH' | 'STALE' | 'NEVER',
    lastImportAt: acc.lastSync || null,
  })) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bancos y Cuentas</h1>
          <p className="text-sm text-muted-foreground">Gestión de cuentas, tarjetas y obligaciones bancarias</p>
        </div>
        {summary?.observedAt && <FreshnessStamp observedAt={summary.observedAt} />}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">Cuentas</TabsTrigger>
          <TabsTrigger value="cards">Tarjetas</TabsTrigger>
          <TabsTrigger value="loans">Préstamos</TabsTrigger>
        </TabsList>

        <SplitLayout
          main={
            <div className="space-y-6">
              <TabsContent value="accounts" className="m-0 focus-visible:outline-none">
                <AccountsTab
                  section={accountsData}
                  isLoading={isLoading}
                  onRetry={refetch}
                  onAddAccount={() => setAddAccountOpen(true)}
                />
              </TabsContent>
              <TabsContent value="cards" className="m-0 focus-visible:outline-none">
                <CardsTab
                  section={cardsData}
                  isLoading={isLoading}
                  onRetry={refetch}
                  onAddCard={() => setAddCardOpen(true)}
                />
              </TabsContent>
              <TabsContent value="loans" className="m-0 focus-visible:outline-none">
                <LoansTab
                  section={loansData}
                  isLoading={isLoading}
                  onRetry={refetch}
                />
              </TabsContent>

              {accountsData?.data && accountsData.data.length > 0 && (
                <CashDistributionCard accounts={accountsData.data} />
              )}
            </div>
          }
          rail={
            <div className="space-y-6">
              <RailSection title="Información e Importaciones">
                <div className="space-y-6">
                  <ImportHealthRail items={importHealthItems} />
                  {cardsData?.data && loansData?.data && (
                    <PaymentCalendarCard cards={cardsData.data} loans={loansData.data} />
                  )}
                </div>
              </RailSection>
            </div>
          }
        />
      </Tabs>

      <AddAccountDialog open={addAccountOpen} onOpenChange={setAddAccountOpen} />
      <CardFormDialog open={addCardOpen} onOpenChange={setAddCardOpen} />
    </div>
  )
}
