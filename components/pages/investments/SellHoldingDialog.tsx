'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBanks } from '@/lib/hooks/useBanks'
import { useDeleteHolding } from '@/lib/hooks/useInvestments'
import { formatCurrency } from '@/lib/format'

export interface SellHoldingTarget {
  id: number
  ticker: string
  name?: string
  quantity: number
  currency?: string
  currentPrice?: number | null
  avgPurchasePrice?: number | null
}

export interface SellHoldingDialogProps {
  holding: SellHoldingTarget | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function SellHoldingDialog({
  holding,
  open,
  onOpenChange,
  onSuccess,
}: SellHoldingDialogProps) {
  const t = useTranslations('investments')
  const tc = useTranslations('common')
  const { banks } = useBanks()
  const deleteMutation = useDeleteHolding()

  const [selectedCbu, setSelectedCbu] = useState<string>('')

  const currency = holding?.currency ?? 'ARS'

  // Accounts matching holding currency
  const availableAccounts = useMemo(() => {
    return banks.flatMap((b) =>
      (b.accounts ?? []).filter((a) => a.currency.toUpperCase() === currency.toUpperCase())
    )
  }, [banks, currency])

  useEffect(() => {
    if (open) {
      if (availableAccounts.length > 0) {
        setSelectedCbu(availableAccounts[0].cbu)
      } else {
        setSelectedCbu('')
      }
    }
  }, [open, availableAccounts])

  const liquidationValue = useMemo(() => {
    if (!holding) return 0
    const price = holding.currentPrice ?? holding.avgPurchasePrice ?? 0
    return holding.quantity * price
  }, [holding])

  const handleSell = async () => {
    if (!holding) return

    try {
      await deleteMutation.mutateAsync({
        id: holding.id,
        destinationCbu: selectedCbu || undefined,
      })

      toast.success(
        t('holdings.toastSold', {
          ticker: holding.ticker,
          amount: formatCurrency(liquidationValue, currency),
        })
      )
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      toast.error(err?.message || t('holdings.toastSellFailed'))
    }
  }

  if (!holding) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {t('holdings.sellTitle', { ticker: holding.ticker })}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('holdings.sellDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          {/* Liquidation Summary Card */}
          <div className="p-3.5 bg-muted/60 rounded-xl border border-border space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('holdings.availableQuantity')}:</span>
              <span className="font-mono font-bold text-foreground">
                {holding.quantity} {tc('units')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('tabs.colPrice')}:</span>
              <span className="font-mono font-bold text-foreground">
                {formatCurrency(holding.currentPrice ?? holding.avgPurchasePrice ?? 0, currency)}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-1.5 font-bold">
              <span className="text-foreground">{t('holdings.liquidationTotal')}:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {formatCurrency(liquidationValue, currency)}
              </span>
            </div>
          </div>

          {/* Destination CBU account picker */}
          <div className="space-y-1.5">
            <Label htmlFor="destination-cbu">{t('holdings.destinationAccountLabel')}</Label>
            {availableAccounts.length > 0 ? (
              <Select value={selectedCbu} onValueChange={setSelectedCbu}>
                <SelectTrigger id="destination-cbu" className="h-9">
                  <SelectValue placeholder={t('holdings.selectDestinationAccount')} />
                </SelectTrigger>
                <SelectContent>
                  {availableAccounts.map((a) => (
                    <SelectItem key={a.cbu} value={a.cbu}>
                      {a.name} ({a.cbu.slice(-4)}) — {formatCurrency(parseFloat(a.balance) || 0, a.currency)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-[11px] text-amber-500">
                {t('holdings.noAccountInBank', { currency })}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              {t('holdings.destinationAccountHint')}
            </p>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {tc('cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleteMutation.isPending}
            onClick={handleSell}
          >
            {deleteMutation.isPending ? t('holdings.selling') : t('holdings.confirmSell')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
