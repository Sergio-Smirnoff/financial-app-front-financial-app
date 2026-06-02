'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Card } from '@/types/cards'

interface Props {
  cards: Card[]
  onView: (card: Card) => void
  onEdit: (card: Card) => void
  onDelete: (card: Card) => void
}

export function CardList({ cards, onView, onEdit, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((c) => (
        <div
          key={c.cardNumber}
          onClick={() => onView(c)}
          className={`relative aspect-[1.58/1] rounded-2xl p-4 sm:p-5 text-white shadow-xl overflow-hidden group transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer hover:shadow-2xl flex flex-col justify-between ${getCardGradient(c.brand)}`}
        >
          <div>
            <div className="w-8 h-6 sm:w-10 sm:h-8 bg-yellow-400/80 rounded-md mb-3 sm:mb-4 relative overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-3 gap-0.5 opacity-20">
                {Array.from({ length: 9 }).map((_, i) => <div key={i} className="border border-black" />)}
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <p className="text-[10px] sm:text-xs md:text-sm font-mono tracking-[0.15em] sm:tracking-[0.2em] pt-1">•••• •••• •••• {c.cardNumber.slice(-4)}</p>
              <p className="text-[7px] sm:text-[9px] uppercase font-bold tracking-widest opacity-80 truncate max-w-[150px]">{c.displayName}</p>
            </div>
          </div>

          <div className="flex items-end justify-between mt-auto">
            <div>
              <p className="text-[6px] sm:text-[8px] uppercase opacity-60">Expires</p>
              <p className="text-[10px] sm:text-xs font-bold">{c.expiringDate}</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[6px] sm:text-[8px] uppercase h-3 sm:h-4 px-1">
                {c.behavior.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          <div className="absolute top-4 right-4" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                <DropdownMenuItem onClick={() => onEdit(c)} className="gap-2">
                  <Pencil className="h-4 w-4" /> Edit Card
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive gap-2 focus:text-destructive"
                  onClick={() => onDelete(c)}
                >
                  <Trash2 className="h-4 w-4" /> Delete Card
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
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
