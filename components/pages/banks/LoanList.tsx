'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLoans, useLoanInstallments, usePayLoanInstallment } from '@/lib/hooks/useLoans'
import { useBank } from '@/lib/hooks/useBanks'
import { ChevronDown, Plus, CreditCard, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoanForm } from '../loans/LoanForm'

import { QueryBoundary } from '@/components/shared/QueryBoundary'
import { Surface } from '@/components/shared/Surface'

interface Props { bankId: number }

export function LoanList({ bankId }: Props) {
  const { data: loans, isLoading, isError } = useLoans(bankId)
  const [creatingOpen, setCreatingOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Loans</h4>
        <Button size="sm" variant="outline" className="h-8 gap-2 text-xs font-bold border-border" onClick={() => setCreatingOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Loan
        </Button>
      </div>

      <QueryBoundary 
        isLoading={isLoading} 
        isError={!!isError} 
        loadingComponent={
            <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse bg-muted" />)}
            </div>
        }
      >
        {!loans || loans.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground italic">No active loans</p>
        ) : (
            <div className="grid grid-cols-1 gap-4">
            {loans.map((loan) => (
                <div key={loan.id} className="rounded-2xl border bg-muted/40 shadow-none hover:bg-muted/60 transition-colors overflow-hidden group">
                <div 
                    className="flex items-center justify-between p-5 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === loan.id ? null : loan.id)}
                >
                    <div className="flex items-center gap-4">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center border ${loan.active ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted border-border text-muted-foreground'}`}>
                        <CreditCard className="h-5.5 w-5.5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-base">{loan.name}</p>
                            <Badge variant={loan.active ? 'default' : 'secondary'} className={`h-4 px-1.5 text-[9px] uppercase font-bold border-none`}>
                            {loan.active ? 'Active' : 'Closed'}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs mt-0.5">
                            <span className="font-bold text-muted-foreground">{formatCurrency(loan.principal, loan.currency)}</span>
                            <span className="text-muted-foreground/30">•</span>
                            <span className="text-muted-foreground/50 font-medium">{loan.totalInstallments} installments</span>
                        </div>
                    </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Remaining</p>
                            <p className="text-sm font-black">{loan.remainingInstallments} left</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-muted">
                            <ChevronDown className={`h-5 w-5 transition-transform duration-500 ${expandedId === loan.id ? 'rotate-180 text-primary' : ''}`} />
                        </Button>
                    </div>
                </div>
                
                {expandedId === loan.id && (
                    <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                    <div className="pt-4 border-t border-border">
                        <LoanInstallmentSubList loanId={loan.id} currency={loan.currency} bankId={bankId} />
                    </div>
                    </div>
                )}
                </div>
            ))}
            </div>
        )}
      </QueryBoundary>

      <Dialog open={creatingOpen} onOpenChange={setCreatingOpen}>
        <DialogContent className="sm:max-w-md bg-popover border-border">
          <DialogHeader><DialogTitle>New loan</DialogTitle></DialogHeader>
          <LoanForm bankId={bankId} onSuccess={() => setCreatingOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function LoanInstallmentSubList({ loanId, currency, bankId }: { loanId: number, currency: string, bankId: number }) {
  const { data: installments, isLoading } = useLoanInstallments(loanId)
  const { data: bank } = useBank(bankId)
  const payInstallment = usePayLoanInstallment()
  const [selectedAccounts, setSelectedAccounts] = useState<Record<number, number>>({})

  const availableAccounts = useMemo(() => {
    return bank?.accounts.filter(a => a.currency === currency && a.type !== 'INVESTMENT') || []
  }, [bank, currency])

  if (isLoading) return <div className="py-4 flex justify-center"><LoadingSpinner size="sm" /></div>

  return (
    <div className="space-y-1">
      {installments?.map((inst) => {
        const selectedAccountId = selectedAccounts[inst.id];
        return (
          <div key={inst.id} className={`flex items-center gap-4 py-2 px-3 rounded-lg transition-colors ${inst.paid ? 'bg-muted/40' : 'hover:bg-muted'}`}>
            <div className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold ${inst.paid ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
              {inst.installmentNumber}
            </div>
            
            <div className="flex-1 flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs font-medium">{formatDate(inst.dueDate)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`text-sm font-bold ${inst.paid ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {formatCurrency(inst.amount, currency)}
              </span>
              
              {inst.paid ? (
                  <Badge variant="secondary" className="h-6 px-2 text-[10px] font-bold bg-green-500/10 text-green-500 border-none uppercase">
                      Paid
                  </Badge>
              ) : (
                  <div className="flex items-center gap-2">
                      <Select onValueChange={(v) => setSelectedAccounts(prev => ({ ...prev, [inst.id]: Number(v) }))}>
                          <SelectTrigger 
                              className="h-8 w-[140px] text-[10px] font-bold bg-background border-border text-muted-foreground rounded-xl"
                              disabled={availableAccounts.length === 0}
                          >
                              <SelectValue placeholder={availableAccounts.length > 0 ? "Select account" : "No accounts"} />
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
                          className="h-8 text-[10px] px-3 font-bold rounded-xl"
                          disabled={payInstallment.isPending || !selectedAccounts[inst.id]}
                          onClick={() => {
                              payInstallment.mutate(
                                  { loanId, installmentId: inst.id, accountId: selectedAccounts[inst.id]! },
                                  {
                                      onSuccess: () => toast.success('Installment paid'),
                                      onError: (e) => toast.error(e.message || 'Payment failed')
                                  }
                              )
                          }}
                      >
                          Pay
                      </Button>
                  </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  )
}

import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
