'use client'

import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useBank } from '@/lib/hooks/useBanks'
import { useDeleteHolding } from '@/lib/hooks/useInvestments'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils/currency'
import { toast } from 'sonner'
import type { HoldingWithPrice } from '@/types/investments'

interface SellHoldingDialogProps {
  holding: HoldingWithPrice | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function SellHoldingDialog({ holding, open, onOpenChange, onSuccess }: SellHoldingDialogProps) {
  const { data: bank } = useBank(holding?.bankId ?? 0)
  const sellMutation = useDeleteHolding()
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)

  // Reset selection when dialog opens with a new holding
  useEffect(() => {
    if (open) {
      setSelectedAccountId(null)
    }
  }, [open, holding?.id])

  const availableAccounts = useMemo(() => {
    return bank?.accounts.filter(a => a.currency.toUpperCase() === holding?.currency.toUpperCase() && a.type !== 'INVESTMENT') || []
  }, [bank, holding])

  const liquidationValue = useMemo(() => {
    if (!holding) return 0
    return holding.quantity * (holding.currentPrice ?? holding.avgPurchasePrice)
  }, [holding])

  const handleSell = () => {
    if (!holding || !selectedAccountId) return

    sellMutation.mutate(
      { id: holding.id, destinationAccountId: selectedAccountId },
      {
        onSuccess: () => {
          toast.success(`Sold ${holding.ticker} for ${formatCurrency(liquidationValue, holding.currency)}`)
          onSuccess()
        },
        onError: (e: any) => {
          toast.error(e.message || 'Failed to sell holding')
        },
      }
    )
  }

  if (!holding) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Sell Holding: {holding.ticker}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-2xl bg-zinc-800/40 p-5 space-y-3 border border-zinc-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold uppercase tracking-wider">Quantity to sell</span>
                <span className="font-black text-white text-sm">{holding.quantity}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold uppercase tracking-wider">Market Price</span>
                <span className="font-black text-white text-sm">{formatCurrency(holding.currentPrice ?? holding.avgPurchasePrice, holding.currency)}</span>
            </div>
            <div className="pt-3 border-t border-zinc-800/50 flex flex-col items-center gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Estimated Liquidation</span>
                <span className="text-3xl font-black text-white tracking-tighter">
                    {formatCurrency(liquidationValue, holding.currency)}
                </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-zinc-500 ml-1 tracking-widest">Receive funds in</label>
            <Select onValueChange={(v) => setSelectedAccountId(Number(v))}>
                <SelectTrigger className="rounded-xl h-11 bg-zinc-900 border-zinc-800 text-zinc-300">
                    <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    {availableAccounts.map(a => (
                        <SelectItem key={a.id} value={a.id.toString()}>
                            {a.name} ({formatCurrency(a.balance, a.currency)})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {availableAccounts.length === 0 && (
                <p className="text-[10px] text-red-500/80 italic ml-1">No available accounts in {holding.currency.toUpperCase()} to receive funds.</p>
            )}
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" className="rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            className="rounded-xl bg-primary text-primary-foreground font-bold" 
            disabled={!selectedAccountId || sellMutation.isPending}
            onClick={handleSell}
          >
            {sellMutation.isPending ? 'Processing...' : 'Confirm Sale'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
