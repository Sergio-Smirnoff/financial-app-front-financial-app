'use client'

import { useState } from 'react'
import { useLoans, useDeleteLoan, useLoanInstallments, usePayLoanInstallment } from '@/lib/hooks/useLoans'
import { useUiStore } from '@/lib/store/ui.store'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { LoanForm } from './LoanForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { formatCurrency, CURRENCIES } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { toast } from 'sonner'
import type { Loan } from '@/types/finances'

export function LoansContent() {
  const { openConfirmDelete } = useUiStore()
  const [currencyFilter, setCurrencyFilter] = useState<string | undefined>(undefined)
  const { data: loans, isLoading, isError } = useLoans({ currency: currencyFilter })
  const deleteLoan = useDeleteLoan()
  const [formOpen, setFormOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const handleDelete = (loan: Loan) => {
    openConfirmDelete({
      title: 'Delete loan',
      description: `Delete "${loan.description}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteLoan.mutate(loan.id, {
          onSuccess: () => toast.success('Loan deleted'),
          onError: () => toast.error('Failed to delete loan'),
        })
      },
    })
  }

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage message="Failed to load loans." />

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <Select
          value={currencyFilter ?? 'ALL'}
          onValueChange={(v) => setCurrencyFilter(v === 'ALL' ? undefined : v)}
        >
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All currencies</SelectItem>
            {CURRENCIES.map((c) => (
              <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New loan
        </Button>
      </div>

      {loans?.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No loans yet.</p>
      )}

      <div className="space-y-3">
        {loans?.map((loan) => (
          <LoanCard
            key={loan.id}
            loan={loan}
            expanded={expandedId === loan.id}
            onToggle={() => setExpandedId(expandedId === loan.id ? null : loan.id)}
            onDelete={() => handleDelete(loan)}
          />
        ))}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New loan</DialogTitle></DialogHeader>
          <LoanForm onSuccess={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog />
    </div>
  )
}

function LoanCard({
  loan,
  expanded,
  onToggle,
  onDelete,
}: {
  loan: Loan
  expanded: boolean
  onToggle: () => void
  onDelete: () => void
}) {
  const { data: installments, isLoading } = useLoanInstallments(expanded ? loan.id : 0)
  const payInstallment = usePayLoanInstallment()

  const paidCount = installments?.filter((i) => i.paid).length ?? 0
  const totalCount = installments?.length ?? loan.totalInstallments
  const progress = totalCount > 0 ? (paidCount / totalCount) * 100 : 0

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-sm font-medium">{loan.description}</CardTitle>
              <Badge variant={loan.active ? 'default' : 'secondary'} className="text-xs">
                {loan.active ? 'Active' : 'Paid'}
              </Badge>
              <Badge variant="outline" className="text-[10px]">{loan.currency}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatCurrency(loan.totalAmount, loan.currency)} · {loan.totalInstallments} installments
              {loan.nextPaymentDate && ` · Next: ${formatDate(loan.nextPaymentDate)}`}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
              <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {installments && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{paidCount} / {totalCount} paid</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <div className="space-y-1 mt-2">
              {installments?.map((inst) => (
                <div key={inst.id} className="flex items-center gap-3 py-1 border-t text-sm">
                  <span className="w-6 text-xs text-muted-foreground text-center">{inst.installmentNumber}</span>
                  <span className="flex-1 text-muted-foreground">{formatDate(inst.dueDate)}</span>
                  <span className="font-medium">{formatCurrency(inst.amount, loan.currency)}</span>
                  {inst.paid ? (
                    <Badge variant="secondary" className="text-xs w-16 justify-center">Paid</Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-xs px-2"
                      disabled={payInstallment.isPending}
                      onClick={() =>
                        payInstallment.mutate(
                          { loanId: loan.id, installmentId: inst.id },
                          {
                            onSuccess: () => toast.success('Installment paid'),
                            onError: () => toast.error('Failed to pay installment'),
                          },
                        )
                      }
                    >
                      Pay
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
