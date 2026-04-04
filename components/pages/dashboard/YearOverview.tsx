'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/currency'
import { TrendingUp, TrendingDown, Scale, Wallet } from 'lucide-react'
import type { SummaryItem } from '@/types/finances'

interface YearOverviewProps {
  summary: SummaryItem | undefined
  currency: string
}

export function YearOverview({ summary, currency }: YearOverviewProps) {
  const income = summary?.totalIncome ?? 0
  const expenses = summary?.totalExpense ?? 0
  const balance = summary?.balance ?? 0
  const totalDebt = (summary?.totalLoanDebt ?? 0) + (summary?.totalCardExpenseDebt ?? 0)
  const year = new Date().getFullYear()

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Year to Date ({year})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Income
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(income, currency)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Expenses
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(expenses, currency)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Scale className="h-4 w-4" />
              Net Balance
            </div>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatCurrency(balance, currency)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4" />
              Total Debt
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(totalDebt, currency)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
