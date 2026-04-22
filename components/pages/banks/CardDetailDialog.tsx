'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCardInstallments, useMarkInstallmentPaid } from '@/lib/hooks/useCards'
import { useBank } from '@/lib/hooks/useBanks'
import { Badge } from '@/components/ui/badge'
import { CardInstallment, Card } from '@/types/cards'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { ChevronDown, ChevronRight, CreditCard, Plus, CalendarClock } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CardExpenseDialog } from './CardExpenseDialog'
import { toast } from 'sonner'

interface Props { card: Card | null; open: boolean; onOpenChange: (o: boolean) => void; bankId: number }

export function CardDetailDialog({ card, open, onOpenChange, bankId }: Props) {
  const { data: installments, isLoading } = useCardInstallments(open ? card?.id ?? null : null)
  const { data: bank } = useBank(bankId)
  const markPaid = useMarkInstallmentPaid(card?.id ?? 0)
  const [expandedPurchases, setExpandedPurchases] = useState<Record<string, boolean>>({})
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [selectedAccounts, setSelectedAccounts] = useState<Record<number, number>>({})

  const getAvailableAccounts = (currency: string) => {
    return bank?.accounts.filter(a => a.currency === currency && a.type !== 'INVESTMENT') || []
  }

  const purchases = useMemo(() => {
    if (!installments) return []
    const groups: Record<string, {
        description: string,
        totalAmount: number,
        currency: string,
        totalInstallments: number,
        installments: CardInstallment[]
    }> = {}

    installments.forEach(inst => {
        const key = `${inst.description}-${inst.totalAmount}-${inst.currency}-${inst.totalInstallments}`
        if (!groups[key]) {
            groups[key] = {
                description: inst.description,
                totalAmount: inst.totalAmount,
                currency: inst.currency,
                totalInstallments: inst.totalInstallments,
                installments: []
            }
        }
        groups[key].installments.push(inst)
    })

    return Object.values(groups).map(g => ({
        ...g,
        installments: g.installments.sort((a, b) => a.installmentNumber - b.installmentNumber),
        paidCount: g.installments.filter(i => i.paid).length
    })).sort((a, b) => {
        // Sort by the first installment due date
        const dateA = new Date(a.installments[0].dueDate).getTime()
        const dateB = new Date(b.installments[0].dueDate).getTime()
        return dateB - dateA // Newest purchases first
    })
  }, [installments])

  const upcoming = useMemo(() => {
    if (!installments) return []
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const threeDaysLater = new Date()
    threeDaysLater.setDate(now.getDate() + 3)

    return installments.filter(inst => {
        if (inst.paid) return false
        const dueDate = new Date(inst.dueDate)
        return dueDate >= now && dueDate <= threeDaysLater
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [installments])

  const togglePurchase = (key: string) => {
    setExpandedPurchases(prev => ({ ...prev, [key]: !prev[key] }))
  }

  if (!card) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden bg-popover border-border">
          <div className="p-6 bg-muted/30 border-b border-border shrink-0">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-background border border-border flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                        <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold">{card.displayName}</DialogTitle>
                        <p className="text-xs text-muted-foreground font-mono tracking-tight mt-0.5">
                            {card.brand} •••• {card.last4Digits} | {card.behavior.replace('_', ' ')}
                        </p>
                    </div>
                </div>
                <Button size="sm" className="gap-2 rounded-xl font-bold" onClick={() => setExpenseOpen(true)}>
                    <Plus className="h-4 w-4" /> Add Expense
                </Button>
              </div>
            </DialogHeader>
          </div>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {isLoading ? (
                <p className="py-4 text-center text-sm text-muted-foreground italic">Loading installments…</p>
              ) : purchases.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground italic">No purchases recorded for this card.</p>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Purchases</h3>
                  {purchases.map((p) => {
                    const key = `${p.description}-${p.totalAmount}`
                    const isExpanded = expandedPurchases[key]
                    const isFullyPaid = p.paidCount === p.totalInstallments

                    return (
                      <div key={key} className="border border-border rounded-2xl overflow-hidden bg-card shadow-none">
                        <button
                          onClick={() => togglePurchase(key)}
                          className={`w-full flex items-center justify-between p-4 transition-colors text-left ${isExpanded ? 'bg-muted/40' : 'hover:bg-muted/20'}`}
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                            <div>
                                <p className="font-bold">{p.description}</p>
                                <p className="text-xs text-muted-foreground font-medium">
                                    {p.paidCount} of {p.totalInstallments} paid • <span className="text-muted-foreground font-bold">{formatCurrency(p.totalAmount, p.currency)}</span>
                                </p>
                            </div>
                          </div>
                          {isFullyPaid && <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none uppercase text-[9px] font-bold">Fully Paid</Badge>}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-border bg-muted/20">
                            <div className="divide-y divide-border/50">
                                {p.installments.map((inst) => (
                                    <div key={inst.id} className="py-3 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-muted-foreground w-8">#{inst.installmentNumber}</span>
                                            <div>
                                                <p className={`text-sm font-bold ${inst.paid ? 'text-muted-foreground' : 'text-foreground'}`}>{formatCurrency(inst.amount, inst.currency)}</p>
                                                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter">Due {formatDate(inst.dueDate)}</p>
                                            </div>
                                        </div>
                                        {inst.paid ? (
                                            <Badge variant="outline" className="text-[9px] border-border text-muted-foreground font-bold uppercase">Paid {formatDate(inst.paidDate!)}</Badge>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Select onValueChange={(v) => setSelectedAccounts(prev => ({ ...prev, [inst.id]: Number(v) }))}>
                                                    <SelectTrigger 
                                                        className="h-8 w-[140px] text-[10px] font-bold bg-background border-border text-muted-foreground rounded-xl"
                                                        disabled={getAvailableAccounts(inst.currency).length === 0}
                                                    >
                                                        <SelectValue placeholder={getAvailableAccounts(inst.currency).length > 0 ? "Account..." : "No accounts"} />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-popover border-border">
                                                        {getAvailableAccounts(inst.currency).map(a => (
                                                            <SelectItem key={a.id} value={a.id.toString()} className="text-[10px]">
                                                                {a.name} ({formatCurrency(a.balance, a.currency)})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button
                                                    size="sm"
                                                    className="h-8 text-[10px] px-3 font-bold rounded-xl"
                                                    disabled={markPaid.isPending || !selectedAccounts[inst.id]}
                                                    onClick={() => markPaid.mutate(
                                                        { installmentId: inst.id, accountId: selectedAccounts[inst.id]! },
                                                        {
                                                            onSuccess: () => toast.success('Installment paid'),
                                                            onError: (e) => toast.error(e.message || 'Payment failed')
                                                        }
                                                    )}
                                                >
                                                    Pay
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {upcoming.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-destructive" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-destructive">Próximos Vencimientos</h3>
                  </div>
                  <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-4 space-y-2">
                    {upcoming.map(inst => (
                        <div key={inst.id} className="flex items-center justify-between text-sm">
                            <div className="min-w-0 flex-1 mr-4">
                                <p className="font-bold truncate">{inst.description}</p>
                                <p className="text-[10px] text-destructive/80 font-bold uppercase">Due {formatDate(inst.dueDate)} (#{inst.installmentNumber}/{inst.totalInstallments})</p>
                            </div>
                            <p className="font-black shrink-0">{formatCurrency(inst.amount, inst.currency)}</p>
                        </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <CardExpenseDialog
        cardId={card.id}
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
      />
    </>
  )
}
