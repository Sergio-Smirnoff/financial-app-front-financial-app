'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MultiCurrencyAmount } from '@/components/shared/MultiCurrencyAmount'
import { TrendingUp, TrendingDown, Scale, Receipt } from 'lucide-react'
import type { SummaryItem } from '@/types/finances'

interface MonthSummaryProps {
  summaries: SummaryItem[]
  loanCount: number
  cardExpenseCount: number
}

export function MonthSummary({ summaries, loanCount, cardExpenseCount }: MonthSummaryProps) {
  const incomeItems = summaries.map((s) => ({ amount: s.totalIncome, currency: s.currency }))
  const expenseItems = summaries.map((s) => ({ amount: s.totalExpense, currency: s.currency }))
  const balanceItems = summaries.map((s) => ({ amount: s.balance, currency: s.currency }))

  const totalBalance = summaries.reduce((sum, s) => sum + s.balance, 0)

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">This Month</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Income</CardTitle>
            <span className="text-green-600 dark:text-green-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              <MultiCurrencyAmount items={incomeItems} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
            <span className="text-red-600 dark:text-red-400">
              <TrendingDown className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              <MultiCurrencyAmount items={expenseItems} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
            <span className={totalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              <Scale className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              <MultiCurrencyAmount items={balanceItems} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Obligations</CardTitle>
            <span className="text-muted-foreground">
              <Receipt className="h-4 w-4" />
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{loanCount + cardExpenseCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">{loanCount} loans, {cardExpenseCount} card expenses</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
