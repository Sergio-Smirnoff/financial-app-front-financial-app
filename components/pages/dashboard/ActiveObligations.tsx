'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { Landmark, CreditCard } from 'lucide-react'
import type { Loan, CardExpense } from '@/types/finances'

interface ActiveObligationsProps {
  loans: Loan[]
  cardExpenses: CardExpense[]
  currency: string
}

export function ActiveObligations({ loans, cardExpenses, currency }: ActiveObligationsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Active Obligations</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="loans">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="loans" className="flex-1 gap-1.5">
              <Landmark className="h-3.5 w-3.5" />
              Loans ({loans.length})
            </TabsTrigger>
            <TabsTrigger value="card-expenses" className="flex-1 gap-1.5">
              <CreditCard className="h-3.5 w-3.5" />
              Card Expenses ({cardExpenses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="loans" className="space-y-3">
            {loans.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No active loans</p>
            ) : (
              loans.map((loan) => (
                <LoanRow key={loan.id} loan={loan} currency={currency} />
              ))
            )}
          </TabsContent>

          <TabsContent value="card-expenses" className="space-y-3">
            {cardExpenses.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No active card expenses</p>
            ) : (
              cardExpenses.map((ce) => (
                <CardExpenseRow key={ce.id} expense={ce} currency={currency} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function LoanRow({ loan, currency }: { loan: Loan; currency: string }) {
  const paidPct = loan.totalInstallments > 0
    ? Math.round((loan.paidInstallments / loan.totalInstallments) * 100)
    : 0
  const remaining = loan.totalInstallments - loan.paidInstallments
  const remainingAmount = remaining * loan.installmentAmount

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{loan.description}</p>
          {loan.entity && (
            <p className="text-xs text-muted-foreground">{loan.entity}</p>
          )}
        </div>
        <Badge variant={paidPct >= 75 ? 'default' : 'secondary'} className="text-xs">
          {loan.paidInstallments}/{loan.totalInstallments}
        </Badge>
      </div>
      <div className="mt-2.5">
        <Progress value={paidPct} className="h-2" />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatCurrency(loan.installmentAmount, currency)}/mo</span>
        <span>{remaining} left &middot; {formatCurrency(remainingAmount, currency)} remaining</span>
      </div>
      {loan.nextPaymentDate && (
        <p className="mt-1 text-xs text-muted-foreground">
          Next: {formatDate(loan.nextPaymentDate)}
        </p>
      )}
    </div>
  )
}

function CardExpenseRow({ expense, currency }: { expense: CardExpense; currency: string }) {
  const paid = expense.totalInstallments - expense.remainingInstallments
  const paidPct = expense.totalInstallments > 0
    ? Math.round((paid / expense.totalInstallments) * 100)
    : 0
  const remainingAmount = expense.remainingInstallments * expense.installmentAmount

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{expense.description}</p>
        </div>
        <Badge variant={paidPct >= 75 ? 'default' : 'secondary'} className="text-xs">
          {paid}/{expense.totalInstallments}
        </Badge>
      </div>
      <div className="mt-2.5">
        <Progress value={paidPct} className="h-2" />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatCurrency(expense.installmentAmount, currency)}/mo</span>
        <span>{expense.remainingInstallments} left &middot; {formatCurrency(remainingAmount, currency)} remaining</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Next: {formatDate(expense.nextDueDate)}
      </p>
    </div>
  )
}
