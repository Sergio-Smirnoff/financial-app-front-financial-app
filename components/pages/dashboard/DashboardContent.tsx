'use client'

import { useUiStore } from '@/lib/store/ui.store'
import { useTransactionSummary } from '@/lib/hooks/useTransactions'
import { useLoans } from '@/lib/hooks/useLoans'
import { useCardExpenses } from '@/lib/hooks/useCardExpenses'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { YearOverview } from './YearOverview'
import { MonthSummary } from './MonthSummary'
import { IncomeExpenseChart } from './IncomeExpenseChart'
import { ActiveObligations } from './ActiveObligations'
import { UpcomingPayments } from './UpcomingPayments'
import { currentMonthRange, currentYearRange } from '@/lib/utils/dates'

export function DashboardContent() {
  const { currency } = useUiStore()
  const { from: monthFrom, to: monthTo } = currentMonthRange()
  const { from: yearFrom, to: yearTo } = currentYearRange()

  const ytdSummary = useTransactionSummary({ currency, dateFrom: yearFrom, dateTo: yearTo })
  const monthSummary = useTransactionSummary({ currency, dateFrom: monthFrom, dateTo: monthTo })
  const loans = useLoans({ active: true, currency })
  const cardExpenses = useCardExpenses({ active: true, currency })

  if (ytdSummary.isLoading || monthSummary.isLoading || loans.isLoading || cardExpenses.isLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />
  }

  if (ytdSummary.isError || monthSummary.isError) {
    return <ErrorMessage message="Failed to load dashboard data." />
  }

  const ytdItem = ytdSummary.data?.[0]
  const monthItem = monthSummary.data?.[0]
  const activeLoanCount = loans.data?.length ?? 0
  const activeCardCount = cardExpenses.data?.length ?? 0

  return (
    <div className="space-y-6">
      {/* Year-to-Date overview — prominent, first */}
      <YearOverview summary={ytdItem} currency={currency} />

      {/* This month stats */}
      <MonthSummary
        summary={monthItem}
        currency={currency}
        loanCount={activeLoanCount}
        cardExpenseCount={activeCardCount}
      />

      {/* Income vs Expenses chart (last 6 months) */}
      <IncomeExpenseChart currency={currency} />

      {/* Active obligations tabs + Upcoming payments side by side on large screens */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActiveObligations
          loans={loans.data ?? []}
          cardExpenses={cardExpenses.data ?? []}
          currency={currency}
        />
        <UpcomingPayments currency={currency} />
      </div>
    </div>
  )
}
