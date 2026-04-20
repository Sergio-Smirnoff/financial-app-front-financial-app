'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCards, useDeleteCard } from '@/lib/hooks/useCards'
import { CardFormDialog } from './CardFormDialog'
import { CardDetailDialog } from './CardDetailDialog'
import { MoreVertical, Plus, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Card } from '@/types/cards'

interface Props { accountId: number }

export function CardList({ accountId }: Props) {
  const { data, isLoading } = useCards(accountId)
  const del = useDeleteCard()
  const [creatingOpen, setCreatingOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [viewingCard, setViewingCard] = useState<Card | null>(null)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Cards</h4>
        <Button size="sm" variant="outline" className="h-8 gap-2 text-xs font-bold" onClick={() => { setEditingCard(null); setCreatingOpen(true); }}>
            <Plus className="h-3.5 w-3.5" /> Add Card
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map(i => <div key={i} className="aspect-[1.58/1] rounded-2xl animate-pulse bg-zinc-100" />)}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-400 italic">No cards registered</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {data.map((c) => (
            <div
                key={c.id}
                onClick={() => setViewingCard(c)}
                className={`relative aspect-[1.58/1] rounded-2xl p-5 text-white shadow-xl overflow-hidden group transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer hover:shadow-2xl ${getCardGradient(c.brand)}`}
            >
              {/* Card Chip Simulation */}
              <div className="w-10 h-8 bg-yellow-400/80 rounded-md mb-4 relative overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-3 gap-0.5 opacity-20">
                    {Array.from({length: 9}).map((_, i) => <div key={i} className="border border-black" />)}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-80">{c.displayName}</p>
                <p className="text-xl font-mono tracking-[0.2em] pt-2">•••• •••• •••• {c.last4Digits}</p>
              </div>

              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                <div>
                  <p className="text-[8px] uppercase opacity-60">Expires</p>
                  <p className="text-xs font-bold">{c.expiringDate.slice(2, 7).replace('-', '/')}</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[8px] uppercase h-4 px-1">
                    {c.behavior.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Actions Dropdown */}
              <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                            onClick={() => setEditingCard(c)}
                            className="gap-2"
                        >
                            <Pencil className="h-4 w-4" /> Edit Card
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600 gap-2"
                            onClick={() => { if (confirm(`Delete card ending in ${c.last4Digits}?`)) del.mutate(c.id) }}
                        >
                            <Trash2 className="h-4 w-4" /> Delete Card
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      <CardFormDialog
        open={creatingOpen || !!editingCard}
        onOpenChange={(o) => { if (!o) { setCreatingOpen(false); setEditingCard(null); } }}
        accountId={accountId}
        card={editingCard}
      />
      <CardDetailDialog
        card={viewingCard}
        open={viewingCard != null}
        onOpenChange={(o) => !o && setViewingCard(null)}
      />
    </div>
  )
}
function getCardGradient(brand: string) {
    switch (brand) {
        case 'VISA':
            return 'bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800';
        case 'MASTERCARD':
            return 'bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900';
        case 'AMEX':
            return 'bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-800';
        default:
            return 'bg-gradient-to-br from-zinc-500 to-zinc-700';
    }
}
