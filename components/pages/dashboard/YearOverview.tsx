'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MultiCurrencyAmount } from '@/components/shared/MultiCurrencyAmount'
import { TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { Surface } from '@/components/shared/Surface'
import type { SummaryItem } from '@/types/finances'

interface YearOverviewProps {
  summaries: SummaryItem[]
}

export function YearOverview({ summaries }: YearOverviewProps) {
  const year = new Date().getFullYear()

  const incomeItems = summaries.map((s) => ({ amount: s.totalIncome, currency: s.currency }))
  const expenseItems = summaries.map((s) => ({ amount: s.totalExpense, currency: s.currency }))
  const balanceItems = summaries.map((s) => ({ amount: s.balance, currency: s.currency }))

  const totalBalance = summaries.reduce((sum, s) => sum + s.balance, 0)

  return (
    <Surface className="border-t-4 border-t-primary" variant="accent">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Year to Date ({year})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              Income
            </div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              <MultiCurrencyAmount items={incomeItems} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-destructive" />
              Expenses
            </div>
            <div className="text-xl font-bold text-destructive">
              <MultiCurrencyAmount items={expenseItems} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Scale className="h-4 w-4" />
              Net Balance
            </div>
            <div className={`text-xl font-bold ${totalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
              <MultiCurrencyAmount items={balanceItems} />
            </div>
          </div>
        </div>
      </CardContent>
    </Surface>
  )
}
