'use client'

import { useState } from 'react'
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

interface Props { bankId: number }

export function LoanList({ bankId }: Props) {
  const { data: loans, isLoading } = useLoans(bankId)
  const [creatingOpen, setCreatingOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Loans</h4>
        <Button size="sm" variant="outline" className="h-8 gap-2 text-xs font-bold" onClick={() => setCreatingOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add Loan
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse bg-zinc-100" />)}
        </div>
      ) : !loans || loans.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400 italic">No active loans</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {loans.map((loan) => (
            <div key={loan.id} className="rounded-2xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div 
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-zinc-50/50"
                onClick={() => setExpandedId(expandedId === loan.id ? null : loan.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${loan.active ? 'bg-indigo-50 text-indigo-600' : 'bg-zinc-50 text-zinc-400'}`}>
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-zinc-900">{loan.name}</p>
                        <Badge variant={loan.active ? 'default' : 'secondary'} className="h-4 px-1.5 text-[9px] uppercase font-bold">
                        {loan.active ? 'Active' : 'Closed'}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                        <span className="font-bold text-zinc-700">{formatCurrency(loan.principal, loan.currency)}</span>
                        <span>•</span>
                        <span>{loan.totalInstallments} installments</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase font-bold text-zinc-400">Remaining</p>
                        <p className="text-sm font-black text-zinc-900">{loan.remainingInstallments} left</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-zinc-400">
                        <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${expandedId === loan.id ? 'rotate-180 text-primary' : ''}`} />
                    </Button>
                </div>
              </div>
              
              {expandedId === loan.id && (
                <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-300">
                  <div className="pt-4 border-t border-zinc-100">
                    <LoanInstallmentSubList loanId={loan.id} currency={loan.currency} bankId={bankId} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={creatingOpen} onOpenChange={setCreatingOpen}>
        <DialogContent className="sm:max-w-md">
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
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)

  const availableAccounts = useMemo(() => {
    return bank?.accounts.filter(a => a.currency === currency && a.type !== 'INVESTMENT' && a.type !== 'CASH') || []
  }, [bank, currency])

  if (isLoading) return <div className="py-4 flex justify-center"><LoadingSpinner size="sm" /></div>

  return (
    <div className="space-y-1">
      {installments?.map((inst) => (
        <div key={inst.id} className={`flex items-center gap-4 py-2 px-3 rounded-lg transition-colors ${inst.paid ? 'bg-zinc-50/50' : 'hover:bg-zinc-50'}`}>
          <div className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-bold ${inst.paid ? 'bg-zinc-100 text-zinc-400' : 'bg-primary/10 text-primary'}`}>
            {inst.installmentNumber}
          </div>
          
          <div className="flex-1 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-zinc-500">
                <Calendar className="h-3 w-3" />
                <span className="text-xs font-medium">{formatDate(inst.dueDate)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className={`text-sm font-bold ${inst.paid ? 'text-zinc-400' : 'text-zinc-900'}`}>
                {formatCurrency(inst.amount, currency)}
            </span>
            
            {inst.paid ? (
                <Badge variant="secondary" className="h-6 px-2 text-[10px] font-bold bg-green-50 text-green-700 border-green-100 uppercase">
                    Paid
                </Badge>
            ) : (
                <div className="flex items-center gap-2">
                    <Select onValueChange={(v) => setSelectedAccountId(Number(v))}>
                        <SelectTrigger className="h-7 w-[140px] text-[10px] font-bold">
                            <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableAccounts.map(a => (
                                <SelectItem key={a.id} value={a.id.toString()} className="text-[10px]">
                                    {a.name} ({formatCurrency(a.balance, a.currency)})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        size="sm"
                        className="h-7 text-[10px] px-3 font-bold bg-primary hover:bg-primary/90 text-white shadow-sm"
                        disabled={payInstallment.isPending || !selectedAccountId}
                        onClick={() => {
                            payInstallment.mutate(
                                { loanId, installmentId: inst.id, accountId: selectedAccountId! },
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
      ))}
    </div>
  )
}

function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12"
    }
    return (
        <div className={`animate-spin rounded-full border-2 border-zinc-200 border-t-primary ${sizeClasses[size]}`} />
    )
}
