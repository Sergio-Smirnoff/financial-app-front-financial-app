'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/currency'
import { TrendingUp, TrendingDown, Scale, Receipt } from 'lucide-react'
import type { SummaryItem } from '@/types/finances'

interface MonthSummaryProps {
  summary: SummaryItem | undefined
  currency: string
  loanCount: number
  cardExpenseCount: number
}

export function MonthSummary({ summary, currency, loanCount, cardExpenseCount }: MonthSummaryProps) {
  const income = summary?.totalIncome ?? 0
  const expenses = summary?.totalExpense ?? 0
  const balance = summary?.balance ?? 0

  const stats = [
    {
      title: 'Income',
      value: formatCurrency(income, currency),
      icon: <TrendingUp className="h-4 w-4" />,
      positive: true,
    },
    {
      title: 'Expenses',
      value: formatCurrency(expenses, currency),
      icon: <TrendingDown className="h-4 w-4" />,
      positive: false,
    },
    {
      title: 'Balance',
      value: formatCurrency(balance, currency),
      icon: <Scale className="h-4 w-4" />,
      positive: balance >= 0,
    },
    {
      title: 'Obligations',
      value: String(loanCount + cardExpenseCount),
      icon: <Receipt className="h-4 w-4" />,
      description: `${loanCount} loans, ${cardExpenseCount} card expenses`,
      positive: undefined as boolean | undefined,
    },
  ]

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">This Month</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
              <span className={s.positive === undefined ? 'text-muted-foreground' : s.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {s.icon}
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{s.value}</p>
              {s.description && <p className="mt-1 text-xs text-muted-foreground">{s.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
