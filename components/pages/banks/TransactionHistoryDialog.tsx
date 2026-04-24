'use client'

import { useAccountTransactions } from '@/lib/hooks/useTransactions'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: number
  accountName: string
  currency: string
  bankId?: number
}

export function TransactionHistoryDialog({ open, onOpenChange, accountId, accountName, currency, bankId }: Props) {
  const { data: transactions, isLoading } = useAccountTransactions(accountId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col bg-popover border-border">
        <DialogHeader className="flex flex-row items-center justify-between pr-8">
          <DialogTitle>Recent Activity: {accountName}</DialogTitle>
          {bankId && (
              <Link href={`/banks/${bankId}/transactions?accountId=${accountId}`}>
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest gap-1.5 text-muted-foreground hover:text-primary">
                      Full History <ExternalLink className="h-3 w-3" />
                  </Button>
              </Link>
          )}
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2 mt-2">
          {isLoading ? (
            <div className="py-20 flex justify-center"><LoadingSpinner /></div>
          ) : !transactions || transactions.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">No transactions recorded for this account.</p>
          ) : (
            <div className="space-y-1">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    tx.transferGroupId ? 'bg-muted text-muted-foreground' :
                    tx.type === 'INCOME' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'
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
              
              {transactions.length > 10 && !bankId && (
                  <p className="text-[10px] text-center text-muted-foreground py-4 font-bold uppercase tracking-widest">
                      Showing last 10 transactions. Visit the bank page for full history.
                  </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
