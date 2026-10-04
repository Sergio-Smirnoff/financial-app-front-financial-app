'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
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
import { useCreateHolding, useHoldings, useUpdateHolding } from '@/lib/hooks/useInvestments'
import type { HoldingDraft } from '@/lib/store/holdingDraft.store'
import type { AssetType } from '@/types/investments'
import { formatCurrency } from '@/lib/format'
import { AMOUNT_LIMITS, THRESHOLD_LIMITS, parseDecimal, toPlainDecimal, type DecimalResult } from '@/lib/utils/decimal'
import {
  decimalErrorMessage,
  PURCHASE_PRICE_MESSAGES,
  QUANTITY_MESSAGES,
  THRESHOLD_MESSAGES,
  type DecimalFieldMessages,
} from '@/components/ui-kit/page/investments/decimalErrorMessage'

export interface RecordHoldingDialogProps {
  draft: HoldingDraft | null
  onClose: () => void
}

const formDecimal = (n: number | null | undefined, scale: number) => (n == null ? '' : toPlainDecimal(n, scale))

const exactOrPlain = (exact: string | null | undefined, n: number | null, scale: number) =>
  exact === undefined ? formDecimal(n, scale) : (exact ?? '')

const parseThreshold = (raw: string): DecimalResult | null =>
  raw.trim() === '' ? null : parseDecimal(raw, THRESHOLD_LIMITS)

function FieldError({ id, message }: { id: string; message: string | null }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="text-[11px] font-medium text-destructive">
      {message}
    </p>
  )
}

export function RecordHoldingDialog({ draft, onClose }: RecordHoldingDialogProps) {
  const t = useTranslations('investments')
  const tc = useTranslations('common')
  const { banks } = useBanks()
  const { data: holdings, isLoading: holdingsLoading, isError: holdingsFailed } = useHoldings()
  const createMutation = useCreateHolding()
  const updateMutation = useUpdateHolding()

  const open = draft !== null
  const isEdit = draft?.mode === 'edit'
  const editing = draft?.mode === 'edit' ? holdings?.find((h) => h.id === draft.holdingId) : undefined

  const [bankNumber, setBankNumber] = useState('')
  const [fundingCbu, setFundingCbu] = useState<string>('none')
  const [ticker, setTicker] = useState('')
  const [name, setName] = useState('')
  const [assetType, setAssetType] = useState<AssetType>('STOCK')
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS')
  const [quantity, setQuantity] = useState('')
  const [avgPurchasePrice, setAvgPurchasePrice] = useState('')
  const [notifyGainThresholdPct, setNotifyGainThresholdPct] = useState('')
  const [notifyLossThresholdPct, setNotifyLossThresholdPct] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const loadedFor = useRef<HoldingDraft | null>(null)

  useEffect(() => {
    if (!draft) {
      loadedFor.current = null
      return
    }
    if (loadedFor.current === draft) return
    if (draft.mode === 'edit') {
      if (!editing) return
      setBankNumber(editing.bankNumber)
      setTicker(editing.ticker)
      setName(editing.name)
      setAssetType(editing.assetType)
      setCurrency(editing.currency === 'USD' ? 'USD' : 'ARS')
      setQuantity(editing.exactQuantity ?? toPlainDecimal(editing.quantity))
      setAvgPurchasePrice(exactOrPlain(editing.exactAvgPurchasePrice, editing.avgPurchasePrice, AMOUNT_LIMITS.scale))
      setNotifyGainThresholdPct(
        exactOrPlain(editing.exactNotifyGainThresholdPct, editing.notifyGainThresholdPct, THRESHOLD_LIMITS.scale),
      )
      setNotifyLossThresholdPct(
        exactOrPlain(editing.exactNotifyLossThresholdPct, editing.notifyLossThresholdPct, THRESHOLD_LIMITS.scale),
      )
    } else {
      const { prefill } = draft
      setBankNumber('')
      setTicker(prefill.ticker ?? '')
      setName(prefill.name ?? '')
      setAssetType(prefill.assetType ?? 'STOCK')
      setCurrency(prefill.currency ?? 'ARS')
      setQuantity('')
      setAvgPurchasePrice(formDecimal(prefill.price, AMOUNT_LIMITS.scale))
      setNotifyGainThresholdPct('')
      setNotifyLossThresholdPct('')
    }
    setFundingCbu('none')
    setSubmitted(false)
    loadedFor.current = draft
  }, [draft, editing])

  useEffect(() => {
    if (!open || isEdit || banks.length === 0) return
    setBankNumber((prev) => prev || banks[0].bankNumber)
  }, [open, isEdit, banks])

  const availableAccounts = useMemo(() => {
    if (!bankNumber) return []
    const bank = banks.find((b) => b.bankNumber === bankNumber)
    if (!bank) return []
    return (bank.accounts ?? []).filter((a) => a.currency.toUpperCase() === currency.toUpperCase())
  }, [banks, bankNumber, currency])

  const parsedQuantity = parseDecimal(quantity, AMOUNT_LIMITS)
  const parsedPrice = parseDecimal(avgPurchasePrice, { ...AMOUNT_LIMITS, allowZero: true })
  const parsedGain = parseThreshold(notifyGainThresholdPct)
  const parsedLoss = parseThreshold(notifyLossThresholdPct)
  const totalCalculated = parsedQuantity.ok && parsedPrice.ok ? Number(parsedQuantity.value) * Number(parsedPrice.value) : 0

  const fieldError = (
    result: DecimalResult | null,
    raw: string,
    limits: { scale: number; integerDigits: number },
    messages: DecimalFieldMessages,
  ): string | null =>
    result && !result.ok && (submitted || raw.trim() !== '')
      ? decimalErrorMessage(t, result.reason, limits, messages)
      : null
  const quantityError = fieldError(parsedQuantity, quantity, AMOUNT_LIMITS, QUANTITY_MESSAGES)
  const priceError = fieldError(parsedPrice, avgPurchasePrice, AMOUNT_LIMITS, PURCHASE_PRICE_MESSAGES)
  const gainError = fieldError(parsedGain, notifyGainThresholdPct, THRESHOLD_LIMITS, THRESHOLD_MESSAGES)
  const lossError = fieldError(parsedLoss, notifyLossThresholdPct, THRESHOLD_LIMITS, THRESHOLD_MESSAGES)

  const cleanTicker = ticker.trim().toUpperCase()
  const isPending = isEdit ? updateMutation.isPending : createMutation.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft) return

    if (!bankNumber) {
      toast.error(t('holdings.validation.bankRequired'))
      return
    }
    if (!cleanTicker) {
      toast.error(t('holdings.validation.tickerRequired'))
      return
    }
    if (!parsedQuantity.ok || !parsedPrice.ok || parsedGain?.ok === false || parsedLoss?.ok === false) {
      setSubmitted(true)
      return
    }

    const gainThresh = parsedGain?.ok ? parsedGain.value : null
    const lossThresh = parsedLoss?.ok ? parsedLoss.value : null
    const cleanName = name.trim() || cleanTicker

    try {
      if (draft.mode === 'edit') {
        if (!editing) return
        await updateMutation.mutateAsync({
          id: editing.id,
          body: {
            bankNumber: editing.bankNumber,
            fundingCbu: null,
            ticker: cleanTicker,
            name: cleanName,
            assetType,
            currency: editing.currency,
            quantity: parsedQuantity.value,
            avgPurchasePrice: parsedPrice.value,
            notifyGainThresholdPct: gainThresh,
            notifyLossThresholdPct: lossThresh,
          },
        })
        toast.success(t('holdings.toastUpdated'))
      } else {
        await createMutation.mutateAsync({
          bankNumber,
          fundingCbu: fundingCbu === 'none' ? null : fundingCbu,
          ticker: cleanTicker,
          name: cleanName,
          assetType,
          currency,
          quantity: parsedQuantity.value,
          avgPurchasePrice: parsedPrice.value,
          notifyGainThresholdPct: gainThresh,
          notifyLossThresholdPct: lossThresh,
        })
        toast.success(t('holdings.toastCreated'))
      }
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      toast.error(message || t(isEdit ? 'holdings.toastUpdateFailed' : 'holdings.toastCreateFailed'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">{isEdit ? t('holdings.editTitle') : t('holdings.new')}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit ? t('holdings.editDescription') : t('holdings.newDescription')}
          </DialogDescription>
        </DialogHeader>

        {isEdit && !editing ? (
          <p className="text-sm text-muted-foreground">
            {holdingsLoading
              ? t('holdings.loadingHolding')
              : holdingsFailed ? t('holdings.loadFailed') : t('holdings.notFound')}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="holding-bank">{t('holdings.fieldBank')}</Label>
              <Select value={bankNumber} onValueChange={setBankNumber} disabled={isEdit}>
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

            <div className="space-y-1.5">
              <Label>{t('holdings.fieldCurrency')}</Label>
              <div className="flex gap-2">
                {(['ARS', 'USD'] as const).map((code) => (
                  <Button
                    key={code}
                    type="button"
                    size="sm"
                    disabled={isEdit}
                    variant={currency === code ? 'default' : 'outline'}
                    className="flex-1 font-bold"
                    onClick={() => {
                      setCurrency(code)
                      setFundingCbu('none')
                    }}
                  >
                    {code}
                  </Button>
                ))}
              </div>
            </div>

            {!isEdit && (
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
            )}

            <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
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
              <div className="col-span-2 space-y-1.5 max-md:col-span-1">
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
            {isEdit && editing && cleanTicker !== editing.ticker && (
              <p data-testid="ticker-change-note" className="text-[11px] text-muted-foreground">
                {t('holdings.tickerChangeNote', { ticker: cleanTicker })}
              </p>
            )}

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
            {assetType === 'BOND' && (
              <p data-testid="bond-note" className="rounded-md border border-border bg-muted/40 p-2 text-[11px] text-muted-foreground">
                {t('holdings.bondNote')}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
              <div className="space-y-1.5">
                <Label htmlFor="holding-qty">{tc('quantity')}</Label>
                <Input
                  id="holding-qty"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="100"
                  aria-invalid={quantityError != null}
                  aria-describedby={quantityError != null ? 'holding-qty-error' : undefined}
                  className="font-mono h-9"
                  required
                />
                <FieldError id="holding-qty-error" message={quantityError} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="holding-price">{t('holdings.fieldAvgPurchasePrice')}</Label>
                <Input
                  id="holding-price"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={avgPurchasePrice}
                  onChange={(e) => setAvgPurchasePrice(e.target.value)}
                  placeholder="4850"
                  aria-invalid={priceError != null}
                  aria-describedby={priceError != null ? 'holding-price-error' : undefined}
                  className="font-mono h-9"
                  required
                />
                <FieldError id="holding-price-error" message={priceError} />
              </div>
            </div>

            {!isEdit && totalCalculated > 0 && (
              <div className="p-3 bg-muted/60 rounded-lg border border-border flex items-center justify-between">
                <span className="text-muted-foreground">{t('holdings.totalDebitEstimate')}:</span>
                <span className="font-mono font-bold text-foreground">{formatCurrency(totalCalculated, currency)}</span>
              </div>
            )}

            <div className="border-t border-border pt-3 space-y-2">
              <p className="font-semibold text-foreground text-xs">{t('holdings.notificationsSection')}</p>
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                <div className="space-y-1">
                  <Label htmlFor="gain-thresh" className="text-[11px] text-muted-foreground">
                    {t('holdings.gainAlertPct')}
                  </Label>
                  <Input
                    id="gain-thresh"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder={t('holdings.gainAlertPlaceholder')}
                    value={notifyGainThresholdPct}
                    onChange={(e) => setNotifyGainThresholdPct(e.target.value)}
                    aria-invalid={gainError != null}
                    aria-describedby={gainError != null ? 'gain-thresh-error' : undefined}
                    className="h-8"
                  />
                  <FieldError id="gain-thresh-error" message={gainError} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="loss-thresh" className="text-[11px] text-muted-foreground">
                    {t('holdings.lossAlertPct')}
                  </Label>
                  <Input
                    id="loss-thresh"
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder={t('holdings.lossAlertPlaceholder')}
                    value={notifyLossThresholdPct}
                    onChange={(e) => setNotifyLossThresholdPct(e.target.value)}
                    aria-invalid={lossError != null}
                    aria-describedby={lossError != null ? 'loss-thresh-error' : undefined}
                    className="h-8"
                  />
                  <FieldError id="loss-thresh-error" message={lossError} />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                {tc('cancel')}
              </Button>
              <Button type="submit" size="sm" disabled={isPending}>
                {isEdit
                  ? isPending ? t('holdings.saving') : t('holdings.saveChanges')
                  : isPending ? t('holdings.creating') : t('holdings.create')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
