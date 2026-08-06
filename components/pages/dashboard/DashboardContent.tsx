'use client'

import { useTransactionSummary } from '@/lib/hooks/useTransactions'
import { useLoans } from '@/lib/hooks/useLoans'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { MonthSummary } from './MonthSummary'
import { ActiveObligations } from './ActiveObligations'
import { UpcomingPayments } from './UpcomingPayments'
import { useState, useEffect } from 'react'
import { currentMonthRange, currentYearRange } from '@/lib/utils/dates'
import { getUserFromCookie } from '@/lib/auth'
import { BarPairChart } from '@/components/charts/BarPairChart'

export function DashboardContent() {
  const { from: monthFrom, to: monthTo } = currentMonthRange()
  const { from: yearFrom, to: yearTo } = currentYearRange()
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    const user = getUserFromCookie()
    if (user?.name) setUserName(user.name)
  }, [])

  const ytdSummary = useTransactionSummary({ dateFrom: yearFrom, dateTo: yearTo })
  const monthSummary = useTransactionSummary({ dateFrom: monthFrom, dateTo: monthTo })
  const loans = useLoans()

  if (ytdSummary.isError || monthSummary.isError) {
    return <ErrorMessage message="Failed to load dashboard data." />
  }

  const activeLoanCount = loans.data?.filter(l => l.active).length ?? 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl">Welcome back, <span className="font-bold text-primary">{userName}</span>!</h1>

      {/* This month stats — all currencies */}
      {monthSummary.isLoading ? (
        <div className="animate-pulse h-32 rounded-lg bg-muted" />
      ) : (
        <MonthSummary
          summaries={monthSummary.data ?? []}
          loanCount={activeLoanCount}
          cardExpenseCount={0}
        />
      )}

      {/* Active obligations + Upcoming payments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {loans.isLoading ? (
          <div className="animate-pulse h-48 rounded-lg bg-muted" />
        ) : (
          <ActiveObligations
            loans={loans.data?.filter(l => l.active) ?? []}
          />
        )}
        <UpcomingPayments />
      </div>

      {/* Income vs Expenses chart */}
      <div className="rounded-2xl border border-border p-5 bg-card space-y-4">
        <h2 className="text-sm font-semibold">Resumen de Ingresos vs Egresos</h2>
        <BarPairChart months={[]} currency="ARS" ariaLabel="Ingresos vs egresos" />
      </div>
    </div>
  )
}
