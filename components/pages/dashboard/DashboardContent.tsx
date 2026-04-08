'use client'

import { useTransactionSummary } from '@/lib/hooks/useTransactions'
import { useLoans } from '@/lib/hooks/useLoans'
import { useCardExpenses } from '@/lib/hooks/useCardExpenses'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { YearOverview } from './YearOverview'
import { MonthSummary } from './MonthSummary'
import { ActiveObligations } from './ActiveObligations'
import { UpcomingPayments } from './UpcomingPayments'
import { IncomeExpenseChart } from './IncomeExpenseChart'
import { currentMonthRange, currentYearRange } from '@/lib/utils/dates'
import { getUserFromCookie } from '@/lib/auth'

export function DashboardContent() {
  const { from: monthFrom, to: monthTo } = currentMonthRange()
  const { from: yearFrom, to: yearTo } = currentYearRange()
  const user = getUserFromCookie()

  const ytdSummary = useTransactionSummary({ dateFrom: yearFrom, dateTo: yearTo })
  const monthSummary = useTransactionSummary({ dateFrom: monthFrom, dateTo: monthTo })
  const loans = useLoans({ active: true })
  const cardExpenses = useCardExpenses({ active: true })

  if (ytdSummary.isLoading || monthSummary.isLoading || loans.isLoading || cardExpenses.isLoading) {
    return <LoadingSpinner size="lg" className="mt-8" />
  }

  if (ytdSummary.isError || monthSummary.isError) {
    return <ErrorMessage message="Failed to load dashboard data." />
  }

  const activeLoanCount = loans.data?.length ?? 0
  const activeCardCount = cardExpenses.data?.length ?? 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Welcome back, <span className="font-bold">{user?.name}</span>!</h1>
      {/* Year-to-Date overview — all currencies */}
      <YearOverview summaries={ytdSummary.data ?? []} />

      {/* This month stats — all currencies */}
      <MonthSummary
        summaries={monthSummary.data ?? []}
        loanCount={activeLoanCount}
        cardExpenseCount={activeCardCount}
      />

      {/* Active obligations + Upcoming payments — moved up */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ActiveObligations
          loans={loans.data ?? []}
          cardExpenses={cardExpenses.data ?? []}
        />
        <UpcomingPayments />
      </div>

      {/* Income vs Expenses chart — at the bottom, with local currency picker */}
      <IncomeExpenseChart />
    </div>
  )
}
