'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Lock } from 'lucide-react'
import { ApiError } from '@/lib/api/client'
import { useBanks } from '@/lib/hooks/useBanks'
import { useSellHolding } from '@/lib/hooks/useInvestments'
import { formatMoney, formatQuantity } from '@/lib/format'
import type { HoldingSale } from '@/types/investments'

export interface SellHoldingTarget {
  id: number
  ticker: string
  name?: string
  assetType?: string
  quantity: number
  exactQuantity?: string
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

const SELL_ERROR_KEYS: Readonly<Record<string, string>> = {
  holding_sale_exceeds_quantity: 'holdings.sell.errors.exceedsQuantity',
  resource_not_found: 'holdings.sell.errors.notFound',
  validation_error: 'holdings.sell.errors.invalid',
  finances_service_unavailable: 'holdings.sell.errors.financesUnavailable',
}

const MAX_DECIMALS = 6

const toNumber = (raw: string): number => (raw.trim() === '' ? NaN : Number(raw))

const exceedsDecimals = (raw: string): boolean => (raw.trim().split('.')[1] ?? '').length > MAX_DECIMALS

const withMaxDecimals = (value: number): string => String(Number(value.toFixed(MAX_DECIMALS)))

const sellErrorKey = (err: unknown): string =>
  (err instanceof ApiError && err.code && SELL_ERROR_KEYS[err.code]) || 'holdings.sell.errors.unknown'

export function SellHoldingDialog({
  holding,
  open,
  onOpenChange,
  onSuccess,
}: SellHoldingDialogProps) {
  const t = useTranslations('investments')
  const tc = useTranslations('common')
  const { banks } = useBanks()
  const sellMutation = useSellHolding()

  const [selectedCbu, setSelectedCbu] = useState<string>('')
  const [quantity, setQuantity] = useState('')
  const [useMarketPrice, setUseMarketPrice] = useState(true)
  const [manualPrice, setManualPrice] = useState('')

  const currency = holding?.currency ?? 'ARS'
  const isBond = holding?.assetType === 'BOND'
  const marketPrice = holding?.currentPrice ?? null
  const holdingId = holding?.id
  const heldQuantity = holding == null ? null : (holding.exactQuantity ?? String(holding.quantity))
  const initialisedFor = useRef<number | null>(null)

  const availableAccounts = useMemo(() => {
    return banks.flatMap((b) =>
      (b.accounts ?? []).filter((a) => a.currency.toUpperCase() === currency.toUpperCase())
    )
  }, [banks, currency])

  useEffect(() => {
    if (open && !availableAccounts.some((a) => a.cbu === selectedCbu)) {
      setSelectedCbu(availableAccounts[0]?.cbu ?? '')
    }
  }, [open, availableAccounts, selectedCbu])

  useEffect(() => {
    if (!open || holdingId == null || heldQuantity == null) {
      initialisedFor.current = null
      return
    }
    if (initialisedFor.current === holdingId) return
    initialisedFor.current = holdingId
    setQuantity(heldQuantity)
    setUseMarketPrice(true)
    setManualPrice(!isBond && marketPrice != null ? withMaxDecimals(marketPrice) : '')
    setSelectedCbu(availableAccounts[0]?.cbu ?? '')
  }, [open, holdingId, heldQuantity, isBond, marketPrice, availableAccounts])

  if (!holding) return null

  const qty = toNumber(quantity)
  const price = useMarketPrice ? marketPrice : toNumber(manualPrice)
  const sellsEverything = qty === holding.quantity
  const money = (value: number | string, code = currency) => formatMoney(value, { currency: code })

  const quantityError = !(qty > 0)
    ? t('holdings.sell.quantityPositive')
    : exceedsDecimals(quantity)
      ? t('holdings.sell.quantityDecimals', { max: MAX_DECIMALS })
      : qty > holding.quantity
        ? t('holdings.sell.quantityExceeds', { max: formatQuantity(holding.quantity) })
        : null
  const priceError = useMarketPrice
    ? null
    : !(price != null && price > 0)
      ? t('holdings.sell.pricePositive')
      : exceedsDecimals(manualPrice)
        ? t('holdings.sell.priceDecimals', { max: MAX_DECIMALS })
        : null
  const error = quantityError ?? priceError
  const estimate = !isBond && !error && price != null ? qty * price : null
  const priceLabel = isBond ? t('holdings.sell.manualPricePerHundred') : t('holdings.sell.manualPrice')

  const creditedText = (sale: HoldingSale, destinationCbu: string | null) => {
    if (destinationCbu == null) return t('holdings.sell.toastNoAccount')
    if (Number(sale.bookedAmount) > 0) {
      return t('holdings.sell.toastCredited', { amount: money(sale.bookedAmount, sale.currency) })
    }
    return t('holdings.sell.toastFeesTookAll')
  }

  const handleSell = async () => {
    if (error || sellMutation.isPending) return
    const destinationCbu = selectedCbu || null
    try {
      const sale = await sellMutation.mutateAsync({
        id: holding.id,
        body: {
          quantity: sellsEverything && heldQuantity != null ? heldQuantity : String(qty),
          price: useMarketPrice ? null : price,
          destinationCbu,
        },
      })
      toast.success(
        sale.closed
          ? t('holdings.sell.toastSoldAll', { ticker: holding.ticker })
          : t('holdings.sell.toastSold', {
              quantity: formatQuantity(Number(sale.soldQuantity)),
              ticker: holding.ticker,
            }),
        { description: creditedText(sale, destinationCbu) }
      )
      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      toast.error(t('holdings.sell.toastFailed', { ticker: holding.ticker }), {
        description: t(sellErrorKey(err), { ticker: holding.ticker }),
      })
    }
  }

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
          <div className="p-3.5 bg-muted/60 rounded-xl border border-border space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('holdings.availableQuantity')}</span>
              <span className="font-mono font-bold text-foreground">
                {formatQuantity(holding.quantity)} {tc('units')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('holdings.sell.avgCost')}</span>
              <span className="font-mono text-foreground">
                {holding.avgPurchasePrice != null ? money(holding.avgPurchasePrice) : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                {isBond ? t('holdings.sell.lastQuotePerHundred') : t('holdings.sell.lastQuote')}
              </span>
              <span className="font-mono text-foreground">
                {marketPrice != null ? money(marketPrice) : '—'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sell-quantity">{t('holdings.sell.quantityLabel')}</Label>
            <div className="flex items-center gap-2">
              <Input
                id="sell-quantity"
                type="number"
                inputMode="decimal"
                min={0}
                max={holding.quantity}
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-9 font-mono"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => heldQuantity != null && setQuantity(heldQuantity)}>
                {t('holdings.sell.all')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sell-market-price">{t('holdings.sell.marketPrice')}</Label>
              <Switch id="sell-market-price" checked={useMarketPrice} onCheckedChange={setUseMarketPrice} />
            </div>
            {useMarketPrice ? (
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">{priceLabel}</span>
                <div
                  data-testid="sell-market-price-value"
                  aria-describedby="sell-market-locked-hint"
                  title={t('holdings.sell.marketLockedHint')}
                  className="flex h-9 cursor-not-allowed items-center justify-between rounded-md border border-dashed border-border bg-muted px-3"
                >
                  <span className="font-mono text-sm text-foreground">
                    {marketPrice != null ? money(marketPrice) : '—'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                    <Lock aria-hidden className="h-3 w-3" />
                    {t('holdings.sell.marketLocked')}
                  </span>
                </div>
                <span id="sell-market-locked-hint" className="sr-only">
                  {t('holdings.sell.marketLockedHint')}
                </span>
                <p className="text-[11px] text-muted-foreground">{t('holdings.sell.marketPriceHint')}</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label htmlFor="sell-price">{priceLabel}</Label>
                <Input
                  id="sell-price"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  className="h-9 font-mono"
                />
              </div>
            )}
          </div>

          {isBond && (
            <p data-testid="sell-bond-note" className="text-[11px] text-muted-foreground">
              {t('holdings.sell.bondNote')}
            </p>
          )}

          {estimate != null && (
            <div data-testid="sell-estimate" className="flex justify-between border-t border-border pt-2 font-bold">
              <span className="text-foreground">{t('holdings.sell.estimate')}</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                {money(estimate)}
              </span>
            </div>
          )}

          {error && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {error}
            </p>
          )}

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
                      {a.name} ({a.cbu.slice(-4)}) — {money(parseFloat(a.balance) || 0, a.currency)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-[11px] text-amber-500">
                {t('holdings.noAccountInCurrency', { currency })}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              {t('holdings.destinationAccountHint')}
            </p>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            {tc('cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={sellMutation.isPending || error != null}
            onClick={handleSell}
          >
            {sellMutation.isPending
              ? t('holdings.selling')
              : sellsEverything
                ? t('holdings.confirmSell')
                : t('holdings.sell.confirmPartial', { quantity: formatQuantity(Number.isFinite(qty) ? qty : 0) })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
