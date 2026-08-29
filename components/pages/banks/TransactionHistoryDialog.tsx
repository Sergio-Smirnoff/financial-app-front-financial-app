'use client'

import { useAccountTransactions } from '@/lib/hooks/useTransactions'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/format'
import { formatDate } from '@/lib/utils/dates'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountCbu: string
  accountName: string
  currency: string
}

export function TransactionHistoryDialog({ open, onOpenChange, accountCbu, accountName }: Props) {
  const t = useTranslations('banks')
  const tc = useTranslations('common')
  const { data: transactions, isLoading } = useAccountTransactions(accountCbu)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col bg-popover border-border">
        <DialogHeader>
          <DialogTitle>{t('dialogs.history.title', { account: accountName })}</DialogTitle>
          <DialogDescription>{t('dialogs.history.description')}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 mt-2">
          {isLoading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">{tc('loading')}</div>
          ) : !transactions || transactions.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">{t('dialogs.history.noTransactions')}</p>
          ) : (
            <div className="space-y-1">
              {transactions.slice(0, 20).map((tx) => {
                const amount = Number(tx.amount)
                const inflow = amount >= 0
                return (
                  <div key={tx.transactionId} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${inflow ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
                      {inflow ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{tx.description || tx.category || t('dialogs.history.transactionFallback')}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`font-black text-sm ${inflow ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                        {inflow ? '+' : '-'}{formatCurrency(Math.abs(amount), tx.currency)}
                      </p>
                      {tx.category && (
                        <span className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground">{tx.category}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
