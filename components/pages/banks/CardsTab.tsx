'use client'

import { useState } from 'react'
import { useCards, useDeleteCard } from '@/lib/hooks/useCards'
import { useBanks } from '@/lib/hooks/useBanks'
import { useUiStore } from '@/lib/store/ui.store'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Plus, CreditCard } from 'lucide-react'
import type { Card } from '@/types/cards'
import { CardList } from './CardList'
import { CardFormDialog } from './CardFormDialog'
import { CardDetailDialog } from './CardDetailDialog'
import { toast } from 'sonner'

export function CardsTab() {
  const { banks } = useBanks()
  const [filterBank, setFilterBank] = useState<string>('ALL')
  const { data: cards, isLoading, isError } = useCards(filterBank === 'ALL' ? undefined : filterBank)
  const del = useDeleteCard()
  const { openConfirmDelete } = useUiStore()

  const [creatingOpen, setCreatingOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [viewingCard, setViewingCard] = useState<Card | null>(null)

  const handleDelete = (card: Card) => {
    openConfirmDelete({
      title: 'Delete card',
      description: `Delete card ending in ${card.cardNumber.slice(-4)}? This action cannot be undone.`,
      onConfirm: () => del.mutate(card.cardNumber, {
        onSuccess: () => toast.success('Card deleted'),
        onError: (e) => toast.error(e.message || 'Failed to delete card'),
      }),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={filterBank} onValueChange={setFilterBank}>
          <SelectTrigger className="w-[180px] h-9 rounded-xl border-border bg-background text-xs font-bold text-muted-foreground">
            <SelectValue placeholder="Bank" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="ALL">All Banks</SelectItem>
            {banks.map((b) => <SelectItem key={b.bankNumber} value={b.bankNumber}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => { setEditingCard(null); setCreatingOpen(true); }} className="h-11 px-6 gap-2 rounded-xl font-bold">
          <Plus className="h-5 w-5" /> Add Card
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="aspect-[1.58/1] rounded-2xl animate-pulse bg-muted" />)}
        </div>
      ) : !cards || cards.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-muted/20 p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted border mb-6">
            <CreditCard className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No cards yet</h2>
          <p className="max-w-[340px] text-muted-foreground mb-8">Add a card to one of your banks to track expenses and installments.</p>
          <Button onClick={() => { setEditingCard(null); setCreatingOpen(true); }} size="lg" className="gap-2 rounded-xl font-bold">
            <Plus className="h-5 w-5" /> Add Card
          </Button>
        </div>
      ) : (
        <CardList
          cards={cards}
          onView={setViewingCard}
          onEdit={setEditingCard}
          onDelete={handleDelete}
        />
      )}

      <CardFormDialog
        open={creatingOpen || !!editingCard}
        onOpenChange={(o) => { if (!o) { setCreatingOpen(false); setEditingCard(null); } }}
        bankNumber={filterBank === 'ALL' ? undefined : filterBank}
        card={editingCard}
      />
      <CardDetailDialog
        card={viewingCard}
        open={viewingCard != null}
        onOpenChange={(o) => !o && setViewingCard(null)}
      />
      <ConfirmDialog />
    </div>
  )
}
