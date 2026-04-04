'use client'

import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { transactionsApi } from '@/lib/api/transactions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/currency'
import { prevMonthRange, currentMonthRange } from '@/lib/utils/dates'
import { format, subMonths } from 'date-fns'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface IncomeExpenseChartProps {
  currency: string
}

export function IncomeExpenseChart({ currency }: IncomeExpenseChartProps) {
  const months = useMemo(() => {
    const result = []
    for (let i = 5; i >= 1; i--) {
      result.push(prevMonthRange(i))
    }
    result.push(currentMonthRange())
    return result
  }, [])

  const queries = useQueries({
    queries: months.map((range, i) => ({
      queryKey: ['transactions', 'summary', { currency, dateFrom: range.from, dateTo: range.to }],
      queryFn: () => transactionsApi.getSummary({ currency, dateFrom: range.from, dateTo: range.to }),
    })),
  })

  const isLoading = queries.some((q) => q.isLoading)

  const chartData = useMemo(() => {
    const now = new Date()
    return months.map((_, i) => {
      const date = i < 5 ? subMonths(now, 5 - i) : now
      const data = queries[i]?.data?.[0]
      return {
        month: format(date, 'MMM'),
        Income: data?.totalIncome ?? 0,
        Expenses: data?.totalExpense ?? 0,
      }
    })
  }, [queries, months])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Income vs Expenses (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            Loading chart...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} barGap={2}>
              <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatCompact(v)} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value), currency)}
                contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
              />
              <Legend />
              <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}
