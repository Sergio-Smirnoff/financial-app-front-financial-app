'use client'

import React, { useState } from 'react'
import { useQueryState } from 'nuqs'
import { useBanksPage } from '@/lib/hooks/useBanksPage'
import { useAccounts } from '@/lib/hooks/useBanks'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SplitLayout, RailSection, KpiStrip, KpiTile } from '@/components/ui-kit/layout/KpiStrip'
import { AccountsTab } from './AccountsTab'
import { CardsTab } from './CardsTab'
import { LoansTab } from './LoansTab'
import { ImportHealthRail } from './ImportHealthRail'
import { CashDistributionCard } from './CashDistributionCard'
import { PaymentCalendarCard } from './PaymentCalendarCard'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import { Money } from '@/components/ui-kit/money/Money'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { AddAccountDialog } from './AddAccountDialog'
import { CardFormDialog } from './CardFormDialog'
import type { BffQuery, BanksBff } from '@/lib/api/bff/types'

export interface BanksContentProps {
  query?: BffQuery
  initialData?: BanksBff
}

const SkeletonCard = () => <div className="h-32 rounded-xl bg-muted animate-pulse" />

export function BanksContent({ query = { currency: 'ARS', secondary: 'none' } }: BanksContentProps) {
  const [tab, setTab] = useQueryState('tab', { defaultValue: 'accounts' })
  const { data, isLoading, refetch } = useBanksPage(query)
  const { createAccount, updateAccount } = useAccounts()

  const [addAccountOpen, setAddAccountOpen] = useState(false)
  const [addCardOpen, setAddCardOpen] = useState(false)

  const kpis = data?.kpis
  const accountsData = data?.accounts
  const cardsData = data?.cards
  const loansData = data?.loans
  const importHealth = data?.importHealth
  const cashDistribution = data?.cashDistribution
  const paymentCalendar = data?.paymentCalendar

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bancos y Cuentas</h1>
          <p className="text-sm text-muted-foreground">Gestión de cuentas, tarjetas y obligaciones bancarias</p>
        </div>
        {kpis?.observedAt && <FreshnessStamp observedAt={kpis.observedAt} />}
      </div>

      <SectionState
        section={kpis}
        isLoading={isLoading}
        onRetry={refetch}
        skeleton={
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        {(kpiData) => (
          <KpiStrip>
            <div data-testid="banks-kpi-total-cash">
              <KpiTile label="Efectivo total" value={<Money value={kpiData.totalCash} />} />
            </div>
            <div data-testid="banks-kpi-card-debt">
              <KpiTile label="Deuda en tarjetas" value={<Money value={kpiData.cardDebt} />} />
            </div>
            <div data-testid="banks-kpi-loan-balance">
              <KpiTile label="Saldo de préstamos" value={<Money value={kpiData.loanBalance} />} />
            </div>
            <div>
              <KpiTile label="Cuentas activas" value={<span data-testid="banks-kpi-account-count">{kpiData.accountCount ?? 0}</span>} />
            </div>
          </KpiStrip>
        )}
      </SectionState>

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

              <SectionState
                section={cashDistribution}
                isLoading={isLoading}
                skeleton={<SkeletonCard />}
                onRetry={refetch}
              >
                {(slices) => <CashDistributionCard slices={slices} />}
              </SectionState>
            </div>
          }
          rail={
            <div className="space-y-6">
              <RailSection title="Información e Importaciones">
                <div className="space-y-6">
                  <SectionState
                    section={importHealth}
                    isLoading={isLoading}
                    skeleton={<SkeletonCard />}
                    onRetry={refetch}
                  >
                    {(rows) => <ImportHealthRail rows={rows} />}
                  </SectionState>
                  <SectionState
                    section={paymentCalendar}
                    isLoading={isLoading}
                    skeleton={<SkeletonCard />}
                    onRetry={refetch}
                  >
                    {(entries) => <PaymentCalendarCard entries={entries} />}
                  </SectionState>
                </div>
              </RailSection>
            </div>
          }
        />
      </Tabs>

      <AddAccountDialog
        open={addAccountOpen}
        onOpenChange={setAddAccountOpen}
        onCreate={async (data) => {
          await createAccount(data)
        }}
        onUpdate={async (cbu, data) => {
          await updateAccount({ cbu, data })
        }}
      />
      <CardFormDialog open={addCardOpen} onOpenChange={setAddCardOpen} />
    </div>
  )
}
