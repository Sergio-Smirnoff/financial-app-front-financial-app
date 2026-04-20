'use client'

import { useAccountTransactions } from '@/lib/hooks/useTransactions'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: number
  accountName: string
  currency: string
}

export function TransactionHistoryDialog({ open, onOpenChange, accountId, accountName, currency }: Props) {
  const { data: transactions, isLoading } = useAccountTransactions(accountId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>History: {accountName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="py-20 flex justify-center"><LoadingSpinner /></div>
          ) : !transactions || transactions.length === 0 ? (
            <p className="py-20 text-center text-zinc-500">No transactions recorded for this account.</p>
          ) : (
            <div className="space-y-1">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    tx.transferGroupId ? 'bg-zinc-100 text-zinc-600' :
                    tx.type === 'INCOME' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {tx.transferGroupId ? <ArrowLeftRight className="h-5 w-5" /> :
                     tx.type === 'INCOME' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-zinc-900 truncate">{tx.description || tx.categoryName}</p>
                    <p className="text-xs text-zinc-500">{formatDate(tx.date)}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`font-black text-sm ${
                        tx.transferGroupId ? 'text-zinc-900' :
                        tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                    </p>
                    {tx.transferGroupId && (
                        <Badge variant="outline" className="text-[9px] uppercase font-bold h-4 px-1 opacity-50">Transfer</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
