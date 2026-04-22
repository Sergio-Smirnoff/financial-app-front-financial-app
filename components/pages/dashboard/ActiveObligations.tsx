'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import type { Loan } from '@/types/loans'

interface ActiveObligationsProps {
  loans: Loan[]
}

import { Surface } from '@/components/shared/Surface'

interface ActiveObligationsProps {
  loans: Loan[]
}

export function ActiveObligations({ loans }: ActiveObligationsProps) {
  return (
    <Surface>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Active Obligations — Loans</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {loans.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No active loans</p>
          ) : (
            loans.map((loan) => (
              <LoanRow key={loan.id} loan={loan} />
            ))
          )}
        </div>
      </CardContent>
    </Surface>
  )
}

function LoanRow({ loan }: { loan: Loan }) {
  const paidInstallments = loan.totalInstallments - loan.remainingInstallments
  const progress = loan.totalInstallments > 0
    ? Math.round((paidInstallments / loan.totalInstallments) * 100)
    : 0

  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{loan.name}</p>
            <Badge variant="outline" className="text-[10px] text-muted-foreground">{loan.currency}</Badge>
          </div>
        </div>
        <Badge variant={progress >= 75 ? 'default' : 'secondary'} className="text-xs">
          {paidInstallments}/{loan.totalInstallments}
        </Badge>
      </div>
      <div className="mt-2.5">
        <Progress value={progress} className="h-2" />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Principal: {formatCurrency(loan.principal, loan.currency)}</span>
        <span>{loan.remainingInstallments} installments left</span>
      </div>
    </div>
  )
}
