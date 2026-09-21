'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQueryState } from 'nuqs'
import { useBanksPage } from '@/lib/hooks/useBanksPage'
import { useBanks, useAccounts } from '@/lib/hooks/useBanks'
import { useCards, useDeleteCard } from '@/lib/hooks/useCards'
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
import { RecordTransactionDialog, RecordMode } from './RecordTransactionDialog'
import { TransactionHistoryDialog } from './TransactionHistoryDialog'
import { CardDetailDialog } from './CardDetailDialog'
import { CardExpenseDialog } from './CardExpenseDialog'
import { CreateLoanDialog } from '@/components/pages/loans/CreateLoanDialog'
import type { BffQuery, BanksBff, AccountRow, CardRow } from '@/lib/api/bff/types'
import type { AccountResponse } from '@/types/banks'
import type { Card } from '@/types/cards'

export interface BanksContentProps {
  query?: BffQuery
  initialData?: BanksBff
}

const SkeletonCard = () => <div className="h-32 rounded-xl bg-muted animate-pulse" />

export function BanksContent({ query = { currency: 'ARS', secondary: 'none' } }: BanksContentProps) {
  const t = useTranslations('banks')
  const [tab, setTab] = useQueryState('tab', { defaultValue: 'accounts' })
  const { data, isLoading, refetch } = useBanksPage(query)
  const { createAccount, updateAccount, deleteAccount } = useAccounts()
  const { data: rawCards } = useCards()
  const { banks } = useBanks()
  const deleteCard = useDeleteCard()

  const [addAccountOpen, setAddAccountOpen] = useState(false)
  const [addCardOpen, setAddCardOpen] = useState(false)
  const [addLoanOpen, setAddLoanOpen] = useState(false)

  // Transaction record modal state
  const [recordOpen, setRecordOpen] = useState(false)
  const [recordMode, setRecordMode] = useState<RecordMode>('TRANSFER')
  const [recordAccount, setRecordAccount] = useState<AccountResponse | null>(null)

  // Transaction history modal state
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyAccount, setHistoryAccount] = useState<{ cbu: string; name: string; currency: string } | null>(null)

  // Card detail & expense modal state
  const [detailCardOpen, setDetailCardOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [cardExpenseOpen, setCardExpenseOpen] = useState(false)
  const [cardExpenseNumber, setCardExpenseNumber] = useState('')

  const allAccounts = React.useMemo(() => {
    const flat: AccountResponse[] = []
    for (const b of banks) for (const a of b.accounts) flat.push(a)
    return flat
  }, [banks])

  const toAccountResponse = (row: AccountRow): AccountResponse => {
    const found = allAccounts.find((a) => a.cbu === row.cbu)
    if (found) return found
    return {
      bankNumber: '',
      userId: 0,
      name: row.alias || row.bankName || t('accounts.fallbackName'),
      cbu: row.cbu || '',
      currency: row.balance?.currency || 'ARS',
      balance: String(row.balance?.amount ?? '0'),
      type: 'CHECKING',
      alias: row.alias ?? null,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    }
  }

  const toCard = (row: CardRow): Card => {
    const found = rawCards?.find((c) => c.cardNumber === row.cardNumber)
    if (found) return found
    return {
      bankNumber: '',
      userId: 0,
      displayName: row.alias || row.brand || t('cards.fallbackBrand'),
      brand: (row.brand || 'VISA') as any,
      cardType: 'STANDARD',
      behavior: 'CREDIT',
      cardNumber: row.cardNumber || '',
      expiringDate: '',
      closingDay: 20,
      dueDay: 10,
      createdAt: '',
      updatedAt: '',
    }
  }

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
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
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
              <KpiTile label={t('kpis.totalCash')} value={<Money value={kpiData.totalCash} />} />
            </div>
            <div data-testid="banks-kpi-card-debt">
              <KpiTile label={t('kpis.cardDebt')} value={<Money value={kpiData.cardDebt} />} />
            </div>
            <div data-testid="banks-kpi-loan-balance">
              <KpiTile label={t('kpis.loanBalance')} value={<Money value={kpiData.loanBalance} />} />
            </div>
            <div>
              <KpiTile label={t('kpis.accountCount')} value={<span data-testid="banks-kpi-account-count">{kpiData.accountCount ?? 0}</span>} />
            </div>
          </KpiStrip>
        )}
      </SectionState>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">{t('tabAccounts')}</TabsTrigger>
          <TabsTrigger value="cards">{t('tabCards')}</TabsTrigger>
          <TabsTrigger value="loans">{t('tabLoans')}</TabsTrigger>
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
                  onDeposit={(acc) => {
                    setRecordAccount(toAccountResponse(acc))
                    setRecordMode('DEPOSIT')
                    setRecordOpen(true)
                  }}
                  onWithdraw={(acc) => {
                    setRecordAccount(toAccountResponse(acc))
                    setRecordMode('WITHDRAW')
                    setRecordOpen(true)
                  }}
                  onTransfer={(acc) => {
                    setRecordAccount(toAccountResponse(acc))
                    setRecordMode('TRANSFER')
                    setRecordOpen(true)
                  }}
                  onHistory={(acc) => {
                    setHistoryAccount({
                      cbu: acc.cbu || '',
                      name: acc.alias || acc.bankName || t('accounts.fallbackName'),
                      currency: acc.balance?.currency || 'ARS',
                    })
                    setHistoryOpen(true)
                  }}
                  onDelete={async (acc) => {
                    if (acc.cbu) await deleteAccount(acc.cbu)
                  }}
                />
              </TabsContent>
              <TabsContent value="cards" className="m-0 focus-visible:outline-none">
                <CardsTab
                  section={cardsData}
                  isLoading={isLoading}
                  onRetry={refetch}
                  onAddCard={() => setAddCardOpen(true)}
                  onViewDetail={(card) => {
                    setSelectedCard(toCard(card))
                    setDetailCardOpen(true)
                  }}
                  onAddExpense={(card) => {
                    setCardExpenseNumber(card.cardNumber || '')
                    setCardExpenseOpen(true)
                  }}
                  onDeleteCard={async (card) => {
                    if (card.cardNumber) await deleteCard.mutateAsync(card.cardNumber)
                  }}
                />
              </TabsContent>
              <TabsContent value="loans" className="m-0 focus-visible:outline-none">
                <LoansTab
                  section={loansData}
                  isLoading={isLoading}
                  onRetry={refetch}
                  onAddLoan={() => setAddLoanOpen(true)}
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
              <RailSection title={t('railTitle')}>
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

      <RecordTransactionDialog
        open={recordOpen}
        onOpenChange={setRecordOpen}
        mode={recordMode}
        account={recordAccount}
      />

      {historyAccount && (
        <TransactionHistoryDialog
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          accountCbu={historyAccount.cbu}
          accountName={historyAccount.name}
          currency={historyAccount.currency}
        />
      )}

      <CardDetailDialog
        card={selectedCard}
        open={detailCardOpen}
        onOpenChange={setDetailCardOpen}
      />

      <CardExpenseDialog
        cardNumber={cardExpenseNumber}
        open={cardExpenseOpen}
        onOpenChange={setCardExpenseOpen}
      />

      <CreateLoanDialog open={addLoanOpen} onOpenChange={setAddLoanOpen} />
    </div>
  )
}
