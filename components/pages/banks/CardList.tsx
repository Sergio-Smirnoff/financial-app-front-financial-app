'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCards, useDeleteCard } from '@/lib/hooks/useCards'
import { CardFormDialog } from './CardFormDialog'
import { CardExpenseDialog } from './CardExpenseDialog'
import { CardInstallmentsDialog } from './CardInstallmentsDialog'

interface Props { accountId: number }

export function CardList({ accountId }: Props) {
  const { data, isLoading } = useCards(accountId)
  const del = useDeleteCard()
  const [creatingOpen, setCreatingOpen] = useState(false)
  const [expenseCardId, setExpenseCardId] = useState<number | null>(null)
  const [viewingCardId, setViewingCardId] = useState<number | null>(null)

  return (
    <div className="mt-3 space-y-2 px-4 pb-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Cards</h4>
        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setCreatingOpen(true)}>+ Card</Button>
      </div>

      {isLoading ? (
        <p className="py-2 text-center text-xs text-muted-foreground">Loading…</p>
      ) : !data || data.length === 0 ? (
        <p className="py-2 text-center text-xs text-muted-foreground">No cards yet</p>
      ) : (
        <ul className="space-y-2">
          {data.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 rounded-md border bg-white p-2 text-sm shadow-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{c.displayName}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Badge variant="outline" className="h-4 px-1 text-[9px] uppercase">{c.behavior.replace('_', ' ')}</Badge>
                  <span>exp {c.expiringDate}</span>
                  <span>cut {c.closingDay} / due {c.dueDay}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 px-2 text-xs"
                  disabled={c.behavior === 'INSTANT_PAYMENT'}
                  title={c.behavior === 'INSTANT_PAYMENT' ? 'Instant payment cards use Transactions' : undefined}
                  onClick={() => setExpenseCardId(c.id)}
                >
                  + Expense
                </Button>
                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setViewingCardId(c.id)}>
                  Installments
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 text-zinc-400 hover:text-red-600"
                  disabled={del.isPending}
                  onClick={() => {
                    if (confirm(`Delete ${c.displayName}?`)) del.mutate(c.id)
                  }}
                >
                  ×
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <CardFormDialog open={creatingOpen} onOpenChange={setCreatingOpen} accountId={accountId} />
      <CardExpenseDialog cardId={expenseCardId ?? 0} open={expenseCardId != null} onOpenChange={(o) => !o && setExpenseCardId(null)} />
      <CardInstallmentsDialog cardId={viewingCardId} open={viewingCardId != null} onOpenChange={(o) => !o && setViewingCardId(null)} />
    </div>
  )
}
