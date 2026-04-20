'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCardInstallments, useMarkInstallmentPaid } from '@/lib/hooks/useCards'
import { Badge } from '@/components/ui/badge'
import { CardInstallment, Card } from '@/types/cards'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { ChevronDown, ChevronRight, CreditCard, Plus, CalendarClock } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CardExpenseDialog } from './CardExpenseDialog'

interface Props { card: Card | null; open: boolean; onOpenChange: (o: boolean) => void }

export function CardDetailDialog({ card, open, onOpenChange }: Props) {
  const { data: installments, isLoading } = useCardInstallments(open ? card?.id ?? null : null)
  const markPaid = useMarkInstallmentPaid(card?.id ?? 0)
  const [expandedPurchases, setExpandedPurchases] = useState<Record<string, boolean>>({})
  const [expenseOpen, setExpenseOpen] = useState(false)

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
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <div className="p-6 bg-zinc-50 border-b">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center shadow-sm">
                        <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold">{card.displayName}</DialogTitle>
                        <p className="text-sm text-zinc-500 font-mono tracking-tight">
                            {card.brand} •••• {card.last4Digits} | {card.behavior.replace('_', ' ')}
                        </p>
                    </div>
                </div>
                <Button size="sm" className="gap-2" onClick={() => setExpenseOpen(true)}>
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
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Purchases</h3>
                  {purchases.map((p) => {
                    const key = `${p.description}-${p.totalAmount}`
                    const isExpanded = expandedPurchases[key]
                    const isFullyPaid = p.paidCount === p.totalInstallments

                    return (
                      <div key={key} className="border rounded-2xl overflow-hidden bg-white shadow-sm">
                        <button
                          onClick={() => togglePurchase(key)}
                          className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
                            <div>
                                <p className="font-bold text-zinc-900">{p.description}</p>
                                <p className="text-xs text-zinc-500">
                                    {p.paidCount} of {p.totalInstallments} paid • Total: {formatCurrency(p.totalAmount, p.currency)}
                                </p>
                            </div>
                          </div>
                          {isFullyPaid && <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100">Fully Paid</Badge>}
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 border-t bg-zinc-50/30">
                            <div className="divide-y divide-zinc-100">
                                {p.installments.map((inst) => (
                                    <div key={inst.id} className="py-3 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-zinc-400 w-8">#{inst.installmentNumber}</span>
                                            <div>
                                                <p className="text-sm font-medium">{formatCurrency(inst.amount, inst.currency)}</p>
                                                <p className="text-[10px] text-zinc-400 uppercase font-bold">Due {formatDate(inst.dueDate)}</p>
                                            </div>
                                        </div>
                                        {inst.paid ? (
                                            <Badge variant="outline" className="text-[10px] bg-white">Paid {formatDate(inst.paidDate!)}</Badge>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-xs px-3"
                                                disabled={markPaid.isPending}
                                                onClick={() => markPaid.mutate({ installmentId: inst.id })}
                                            >
                                                Pay
                                            </Button>
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
                    <CalendarClock className="h-4 w-4 text-red-500" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-red-500">Próximos Vencimientos</h3>
                  </div>
                  <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 space-y-2">
                    {upcoming.map(inst => (
                        <div key={inst.id} className="flex items-center justify-between text-sm">
                            <div className="min-w-0 flex-1 mr-4">
                                <p className="font-bold text-zinc-900 truncate">{inst.description}</p>
                                <p className="text-xs text-red-600 font-medium">Due {formatDate(inst.dueDate)} (#{inst.installmentNumber}/{inst.totalInstallments})</p>
                            </div>
                            <p className="font-black text-zinc-900 shrink-0">{formatCurrency(inst.amount, inst.currency)}</p>
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
