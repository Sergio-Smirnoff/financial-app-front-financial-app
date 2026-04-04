'use client'

import { useUpcomingPayments } from '@/lib/hooks/useDashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { currentMonthRange } from '@/lib/utils/dates'
import { CalendarClock, Landmark, CreditCard, CheckCircle2 } from 'lucide-react'
import type { UpcomingPayment } from '@/types/finances'

interface UpcomingPaymentsProps {
  currency: string
}

export function UpcomingPayments({ currency }: UpcomingPaymentsProps) {
  const { from, to } = currentMonthRange()
  const { data: payments, isLoading } = useUpcomingPayments({ currency, from, to })

  const unpaid = payments?.filter((p) => !p.paid) ?? []
  const paid = payments?.filter((p) => p.paid) ?? []
  const totalDue = unpaid.reduce((sum, p) => sum + p.amount, 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <CalendarClock className="h-4 w-4" />
            Due This Month
          </CardTitle>
          {!isLoading && (
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(totalDue, currency)} pending
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Loading...</p>
        ) : !payments || payments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No payments due this month</p>
        ) : (
          <div className="space-y-2">
            {unpaid.map((p, i) => (
              <PaymentRow key={`unpaid-${p.sourceId}-${p.type}-${i}`} payment={p} currency={currency} />
            ))}
            {paid.length > 0 && (
              <>
                <div className="my-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span>Already paid ({paid.length})</span>
                  <div className="flex-1 border-t" />
                </div>
                {paid.map((p, i) => (
                  <PaymentRow key={`paid-${p.sourceId}-${p.type}-${i}`} payment={p} currency={currency} />
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PaymentRow({ payment, currency }: { payment: UpcomingPayment; currency: string }) {
  const Icon = payment.type === 'LOAN' ? Landmark : CreditCard

  return (
    <div className={`flex items-center justify-between rounded-lg border p-3 ${payment.paid ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{payment.description}</p>
          <p className="text-xs text-muted-foreground">
            Installment {payment.installmentNumber}/{payment.totalInstallments}
            {' '}&middot; Due {formatDate(payment.dueDate)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${payment.paid ? 'text-green-600 line-through' : ''}`}>
          {formatCurrency(payment.amount, currency)}
        </span>
        <Badge variant={payment.type === 'LOAN' ? 'default' : 'secondary'} className="text-[10px]">
          {payment.type === 'LOAN' ? 'Loan' : 'Card'}
        </Badge>
      </div>
    </div>
  )
}
