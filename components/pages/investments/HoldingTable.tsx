'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { formatCurrency, formatAmount } from '@/lib/utils/currency'
import { cn } from '@/lib/utils'
import type { HoldingWithPrice } from '@/types/investments'

interface HoldingTableProps {
  holdings: HoldingWithPrice[]
  onEdit: (holding: HoldingWithPrice) => void
  onDelete: (holding: HoldingWithPrice) => void
  onViewDetail: (holding: HoldingWithPrice) => void
}

export function HoldingTable({ holdings, onEdit, onDelete, onViewDetail }: HoldingTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead className="hidden sm:table-cell">Name</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right hidden md:table-cell">Avg Price</TableHead>
            <TableHead className="text-right">Current</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Value</TableHead>
            <TableHead className="text-right">P&L</TableHead>
            <TableHead className="text-right hidden md:table-cell">P&L %</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((h) => (
            <TableRow key={h.id}>
              <TableCell className="font-medium">
                <button
                  onClick={() => onViewDetail(h)}
                  className="hover:underline cursor-pointer text-left"
                >
                  {h.ticker}
                </button>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground">{h.name}</TableCell>
              <TableCell className="text-right">{formatAmount(h.quantity)}</TableCell>
              <TableCell className="text-right hidden md:table-cell">
                {formatCurrency(h.avgPurchasePrice, h.currency)}
              </TableCell>
              <TableCell className="text-right">
                {h.currentPrice != null ? formatCurrency(h.currentPrice, h.currency) : '—'}
              </TableCell>
              <TableCell className="text-right hidden sm:table-cell">
                {h.currentValue != null ? formatCurrency(h.currentValue, h.currency) : '—'}
              </TableCell>
              <TableCell className={cn('text-right font-medium', plColor(h.plAmount))}>
                {h.plAmount != null
                  ? `${h.plAmount >= 0 ? '+' : ''}${formatCurrency(h.plAmount, h.currency)}`
                  : '—'}
              </TableCell>
              <TableCell className={cn('text-right hidden md:table-cell', plColor(h.plPercent))}>
                {h.plPercent != null
                  ? `${h.plPercent >= 0 ? '+' : ''}${h.plPercent.toFixed(2)}%`
                  : '—'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 justify-end">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(h)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={() => onDelete(h)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function plColor(value: number | null): string {
  if (value == null) return ''
  if (value > 0) return 'text-green-600'
  if (value < 0) return 'text-red-600'
  return ''
}
