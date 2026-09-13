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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBanks } from '@/lib/hooks/useBanks'
import { useCreateHolding } from '@/lib/hooks/useInvestments'
import type { AssetType } from '@/types/investments'
import { formatCurrency } from '@/lib/format'

export interface RecordHoldingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTicker?: string
  initialName?: string
  initialAssetType?: AssetType
  initialPrice?: number
  initialCurrency?: 'ARS' | 'USD'
}

export function RecordHoldingDialog({
  open,
  onOpenChange,
  initialTicker = '',
  initialName = '',
  initialAssetType = 'STOCK',
  initialPrice,
  initialCurrency = 'ARS',
}: RecordHoldingDialogProps) {
  const t = useTranslations('investments')
  const tc = useTranslations('common')
  const { banks } = useBanks()
  const createMutation = useCreateHolding()

  const [bankNumber, setBankNumber] = useState('')
  const [fundingCbu, setFundingCbu] = useState<string>('none')
  const [ticker, setTicker] = useState(initialTicker)
  const [name, setName] = useState(initialName)
  const [assetType, setAssetType] = useState<AssetType>(initialAssetType)
  const [currency, setCurrency] = useState<'ARS' | 'USD'>(initialCurrency)
  const [quantity, setQuantity] = useState('')
  const [avgPurchasePrice, setAvgPurchasePrice] = useState(initialPrice ? String(initialPrice) : '')
  const [notifyGainThresholdPct, setNotifyGainThresholdPct] = useState('')
  const [notifyLossThresholdPct, setNotifyLossThresholdPct] = useState('')

  useEffect(() => {
    if (open) {
      setTicker(initialTicker || '')
      setName(initialName || '')
      setAssetType(initialAssetType || 'STOCK')
      setCurrency(initialCurrency || 'ARS')
      setAvgPurchasePrice(initialPrice ? String(initialPrice) : '')
      setQuantity('')
      setNotifyGainThresholdPct('')
      setNotifyLossThresholdPct('')
      setFundingCbu('none')
      if (banks.length > 0) {
        setBankNumber((prev) => prev || banks[0].bankNumber)
      }
    }
  }, [open, initialTicker, initialName, initialAssetType, initialPrice, initialCurrency, banks])

  // Available debit accounts matching selected currency
  const availableAccounts = useMemo(() => {
    if (!bankNumber) return []
    const bank = banks.find((b) => b.bankNumber === bankNumber)
    if (!bank) return []
    return (bank.accounts ?? []).filter((a) => a.currency.toUpperCase() === currency.toUpperCase())
  }, [banks, bankNumber, currency])

  const totalCalculated = useMemo(() => {
    const q = parseFloat(quantity)
    const p = parseFloat(avgPurchasePrice)
    if (isNaN(q) || isNaN(p) || q <= 0 || p <= 0) return 0
    return q * p
  }, [quantity, avgPurchasePrice])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bankNumber) {
      toast.error(t('holdings.validation.bankRequired'))
      return
    }
    if (!ticker.trim()) {
      toast.error(t('holdings.validation.tickerRequired'))
      return
    }
    const qNum = parseFloat(quantity)
    if (isNaN(qNum) || qNum <= 0) {
      toast.error(t('holdings.validation.mustBePositive'))
      return
    }
    const pNum = parseFloat(avgPurchasePrice)
    if (isNaN(pNum) || pNum < 0) {
      toast.error(t('holdings.validation.mustBeZeroOrPositive'))
      return
    }

    const gainThresh = notifyGainThresholdPct ? parseFloat(notifyGainThresholdPct) : null
    const lossThresh = notifyLossThresholdPct ? parseFloat(notifyLossThresholdPct) : null

    try {
      await createMutation.mutateAsync({
        bankNumber,
        fundingCbu: fundingCbu === 'none' ? null : fundingCbu,
        ticker: ticker.trim().toUpperCase(),
        name: name.trim() || ticker.trim().toUpperCase(),
        assetType,
        currency,
        quantity: qNum,
        avgPurchasePrice: pNum,
        notifyGainThresholdPct: gainThresh,
        notifyLossThresholdPct: lossThresh,
      })

      toast.success(t('holdings.toastCreated'))
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || t('holdings.toastCreateFailed'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{t('holdings.new')}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {t('holdings.newDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Bank / Broker selection */}
          <div className="space-y-1.5">
            <Label htmlFor="holding-bank">{t('holdings.fieldBank')}</Label>
            <Select value={bankNumber} onValueChange={setBankNumber}>
              <SelectTrigger id="holding-bank" className="h-9">
                <SelectValue placeholder={t('holdings.selectBankPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {banks.map((b) => (
                  <SelectItem key={b.bankNumber} value={b.bankNumber}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Currency Toggle */}
          <div className="space-y-1.5">
            <Label>{t('holdings.fieldCurrency')}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={currency === 'ARS' ? 'default' : 'outline'}
                className="flex-1 font-bold"
                onClick={() => {
                  setCurrency('ARS')
                  setFundingCbu('none')
                }}
              >
                ARS
              </Button>
              <Button
                type="button"
                size="sm"
                variant={currency === 'USD' ? 'default' : 'outline'}
                className="flex-1 font-bold"
                onClick={() => {
                  setCurrency('USD')
                  setFundingCbu('none')
                }}
              >
                USD
              </Button>
            </div>
          </div>

          {/* Funding Account (CBU) */}
          <div className="space-y-1.5">
            <Label htmlFor="holding-funding">{t('holdings.fieldFundingAccount')}</Label>
            <Select value={fundingCbu} onValueChange={setFundingCbu}>
              <SelectTrigger id="holding-funding" className="h-9">
                <SelectValue placeholder={t('holdings.fundingPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('holdings.noFundingDebit')}</SelectItem>
                {availableAccounts.map((a) => (
                  <SelectItem key={a.cbu} value={a.cbu}>
                    {a.name} ({a.cbu.slice(-4)}) — {formatCurrency(parseFloat(a.balance) || 0, a.currency)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ticker & Name */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="holding-ticker">{tc('ticker')}</Label>
              <Input
                id="holding-ticker"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="GGAL"
                className="font-mono uppercase font-bold h-9"
                required
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="holding-name">{t('tabs.colName')}</Label>
              <Input
                id="holding-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('holdings.namePlaceholder')}
                className="h-9"
                required
              />
            </div>
          </div>

          {/* Asset Type */}
          <div className="space-y-1.5">
            <Label htmlFor="holding-asset-type">{t('holdings.fieldAssetType')}</Label>
            <Select value={assetType} onValueChange={(v) => setAssetType(v as AssetType)}>
              <SelectTrigger id="holding-asset-type" className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STOCK">{t('holdings.assetType.STOCK')}</SelectItem>
                <SelectItem value="CEDEAR">{t('holdings.assetType.CEDEAR')}</SelectItem>
                <SelectItem value="BOND">{t('holdings.assetType.BOND')}</SelectItem>
                <SelectItem value="FCI">{t('holdings.assetType.FCI')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quantity & Avg Purchase Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="holding-qty">{tc('quantity')}</Label>
              <Input
                id="holding-qty"
                type="number"
                step="any"
                min="0.0001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                className="font-mono h-9"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="holding-price">{t('holdings.fieldAvgPurchasePrice')}</Label>
              <Input
                id="holding-price"
                type="number"
                step="any"
                min="0"
                value={avgPurchasePrice}
                onChange={(e) => setAvgPurchasePrice(e.target.value)}
                placeholder="4850"
                className="font-mono h-9"
                required
              />
            </div>
          </div>

          {/* Total Calculated Preview */}
          {totalCalculated > 0 && (
            <div className="p-3 bg-muted/60 rounded-lg border border-border flex items-center justify-between">
              <span className="text-muted-foreground">{t('holdings.totalDebitEstimate')}:</span>
              <span className="font-mono font-bold text-foreground">
                {formatCurrency(totalCalculated, currency)}
              </span>
            </div>
          )}

          {/* Threshold Alerts (Optional) */}
          <div className="border-t border-border pt-3 space-y-2">
            <p className="font-semibold text-foreground text-xs">{t('holdings.notificationsSection')}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="gain-thresh" className="text-[11px] text-muted-foreground">
                  {t('holdings.gainAlertPct')}
                </Label>
                <Input
                  id="gain-thresh"
                  type="number"
                  step="any"
                  placeholder="ej: 20"
                  value={notifyGainThresholdPct}
                  onChange={(e) => setNotifyGainThresholdPct(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="loss-thresh" className="text-[11px] text-muted-foreground">
                  {t('holdings.lossAlertPct')}
                </Label>
                <Input
                  id="loss-thresh"
                  type="number"
                  step="any"
                  placeholder="ej: 10"
                  value={notifyLossThresholdPct}
                  onChange={(e) => setNotifyLossThresholdPct(e.target.value)}
                  className="h-8"
                />
              </div>
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
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? t('holdings.creating') : t('holdings.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
