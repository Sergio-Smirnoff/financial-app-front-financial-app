'use client'

import { useState, useMemo } from 'react'
import { useLoans, useDeleteLoan, useLoanInstallments, usePayLoanInstallment } from '@/lib/hooks/useLoans'
import { useUiStore } from '@/lib/store/ui.store'
import { useBanks, useBank } from '@/lib/hooks/useBanks'
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
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { toast } from 'sonner'
import type { Loan } from '@/types/loans'

import { QueryBoundary } from '@/components/shared/QueryBoundary'
import { Surface } from '@/components/shared/Surface'

export function LoansContent() {
  const { openConfirmDelete } = useUiStore()
  const { banks } = useBanks()
  const [accountId, setAccountId] = useState<number | undefined>(undefined)
  const { data: loans, isLoading, isError, error } = useLoans(accountId)
  const deleteLoan = useDeleteLoan()
  const [formOpen, setFormOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const handleDelete = (loan: Loan) => {
    openConfirmDelete({
      title: 'Delete loan',
      description: `Delete "${loan.name}"? This action cannot be undone.`,
      onConfirm: () => {
        deleteLoan.mutate(loan.id, {
          onSuccess: () => toast.success('Loan deleted'),
          onError: () => toast.error('Failed to delete loan'),
        })
      },
    })
  }

  const allAccounts = banks.flatMap(b => b.accounts.map(a => ({ ...a, bankName: b.name })))

  return (
    <div className="space-y-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 shrink-0">
        <Select
          value={accountId?.toString() ?? 'ALL'}
          onValueChange={(v) => setAccountId(v === 'ALL' ? undefined : parseInt(v))}
        >
          <SelectTrigger className="w-48 h-8 text-xs bg-background border-border">
            <SelectValue placeholder="Account" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="ALL">All accounts</SelectItem>
            {allAccounts.map((a) => (
              <SelectItem key={a.id} value={a.id.toString()} className="text-xs">
                {a.bankName} - {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New loan
        </Button>
      </div>

      <QueryBoundary isLoading={isLoading} isError={isError} error={error}>
        {loans?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No loans yet.</p>
        ) : (
          <div className="flex-1 overflow-auto space-y-3">
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
        )}
      </QueryBoundary>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md bg-popover border-border">
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
  const { data: bank } = useBank(loan.bankId)
  const payInstallment = usePayLoanInstallment()
  const [selectedAccounts, setSelectedAccounts] = useState<Record<number, number>>({})

  const availableAccounts = useMemo(() => {
    return bank?.accounts.filter(a => a.currency === loan.currency && a.type !== 'INVESTMENT') || []
  }, [bank, loan.currency])

  const paidCount = installments?.filter((i) => i.paid).length ?? 0
  const totalCount = installments?.length ?? loan.totalInstallments
  const progress = totalCount > 0 ? (paidCount / totalCount) * 100 : 0

  return (
    <Surface>
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-sm font-medium">{loan.name}</CardTitle>
              <Badge variant={loan.active ? 'default' : 'secondary'} className="text-xs">
                {loan.active ? 'Active' : 'Closed'}
              </Badge>
              <Badge variant="outline" className="text-[10px] border-border">{loan.currency}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Principal: {formatCurrency(loan.principal, loan.currency)} · {loan.totalInstallments} installments
              {loan.interestRate > 0 && ` · Int: ${loan.interestRate}%`}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted" onClick={onToggle}>
              <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
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
          <QueryBoundary isLoading={isLoading} isError={false}>
            <div className="space-y-1 mt-2">
              {installments?.map((inst) => {
                const selectedAccountId = selectedAccounts[inst.id];
                return (
                  <div key={inst.id} className="flex items-center gap-3 py-1 border-t border-border text-sm">
                    <span className="w-6 text-xs text-muted-foreground text-center">{inst.installmentNumber}</span>
                    <span className="flex-1 text-muted-foreground">{formatDate(inst.dueDate)}</span>
                    <span className="font-medium">{formatCurrency(inst.amount, loan.currency)}</span>
                    {inst.paid ? (
                      <Badge variant="secondary" className="text-xs w-16 justify-center bg-muted text-muted-foreground">Paid</Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Select onValueChange={(v) => setSelectedAccounts(prev => ({ ...prev, [inst.id]: Number(v) }))}>
                          <SelectTrigger 
                            className="h-7 w-[130px] text-[10px] font-bold bg-background border-border"
                            disabled={availableAccounts.length === 0}
                          >
                            <SelectValue placeholder={availableAccounts.length > 0 ? "Select account" : "No available accounts"} />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            {availableAccounts.map(a => (
                              <SelectItem key={a.id} value={a.id.toString()} className="text-[10px]">
                                {a.name} ({formatCurrency(a.balance, a.currency)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2"
                          disabled={payInstallment.isPending || !selectedAccountId}
                          onClick={() =>
                            payInstallment.mutate(
                              { loanId: loan.id, installmentId: inst.id, accountId: selectedAccountId! },
                              {
                                onSuccess: () => toast.success('Installment paid'),
                                onError: (e) => toast.error(e.message || 'Failed to pay installment'),
                              },
                            )
                          }
                        >
                          Pay
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </QueryBoundary>
        </CardContent>
      )}
    </Surface>
  )
}
