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
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col bg-popover border-border">
        <DialogHeader>
          <DialogTitle>History: {accountName}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="py-20 flex justify-center"><LoadingSpinner /></div>
          ) : !transactions || transactions.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">No transactions recorded for this account.</p>
          ) : (
            <div className="space-y-1">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    tx.transferGroupId ? 'bg-muted text-muted-foreground' :
                    tx.type === 'INCOME' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {tx.transferGroupId ? <ArrowLeftRight className="h-5 w-5" /> :
                     tx.type === 'INCOME' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{tx.description || tx.categoryName}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`font-black text-sm ${
                        tx.transferGroupId ? 'text-foreground' :
                        tx.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                    </p>
                    <div className="flex flex-col items-end gap-1">
                        <span className={`text-[8px] font-bold uppercase tracking-tighter ${
                            tx.type === 'INCOME' ? 'text-green-600/70' : 'text-red-500/70'
                        }`}>
                            {tx.type}
                        </span>
                        {tx.transferGroupId && (
                            <Badge variant="outline" className="text-[8px] uppercase font-black h-3.5 px-1 opacity-50 border-border bg-muted/30">Transfer</Badge>
                        )}
                    </div>
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
