'use client'

import { useState, useMemo } from 'react'
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell Holding: {holding.ticker}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="rounded-xl bg-zinc-50 p-4 space-y-2 border min-h-[120px] flex flex-col justify-center">
            <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Quantity to sell:</span>
                <span className="font-bold">{holding.quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Current Market Price:</span>
                <span className="font-bold">{formatCurrency(holding.currentPrice ?? holding.avgPurchasePrice, holding.currency)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t mt-2">
                <span className="text-sm font-bold text-zinc-900">Estimated Liquidation:</span>
                <span className="text-lg font-black text-primary">{formatCurrency(liquidationValue, holding.currency)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-zinc-500 ml-1">Receive funds in</label>
            <Select onValueChange={(v) => setSelectedAccountId(Number(v))}>
                <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Select destination account" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                    {availableAccounts.map(a => (
                        <SelectItem key={a.id} value={a.id.toString()}>
                            {a.name} ({formatCurrency(a.balance, a.currency)})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {availableAccounts.length === 0 && (
                <p className="text-[10px] text-red-500 italic ml-1">No available accounts in {holding.currency} to receive funds.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            className="rounded-xl bg-primary text-white" 
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
