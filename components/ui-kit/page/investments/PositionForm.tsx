'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AMOUNT_LIMITS, parseDecimal } from '@/lib/utils/decimal'
import { decimalErrorMessage, PURCHASE_PRICE_MESSAGES, QUANTITY_MESSAGES } from './decimalErrorMessage'

export interface PositionFormProps {
  /** 'add' | 'edit' — determines the submit label */
  mode?: 'add' | 'edit'
  onSubmit?: (data: PositionFormData) => void
  onCancel?: () => void
  className?: string
}

export interface PositionFormData {
  ticker: string
  quantity: string
  purchasePrice: string
  currency: string
}

/**
 * Form shell for adding/editing a portfolio position.
 * Mutations are wired in plan 10 — this component is the UI shell only.
 */
export function PositionForm({ mode = 'add', onSubmit, onCancel, className }: PositionFormProps) {
  const t = useTranslations('common')
  const ti = useTranslations('investments')
  const [data, setData] = React.useState<PositionFormData>({
    ticker: '',
    quantity: '',
    purchasePrice: '',
    currency: 'ARS',
  })
  const [submitted, setSubmitted] = React.useState(false)

  const quantity = parseDecimal(data.quantity, AMOUNT_LIMITS)
  const purchasePrice = parseDecimal(data.purchasePrice, { ...AMOUNT_LIMITS, allowZero: true })
  const quantityError =
    submitted && !quantity.ok ? decimalErrorMessage(ti, quantity.reason, AMOUNT_LIMITS, QUANTITY_MESSAGES) : null
  const priceError =
    submitted && !purchasePrice.ok ? decimalErrorMessage(ti, purchasePrice.reason, AMOUNT_LIMITS, PURCHASE_PRICE_MESSAGES) : null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!quantity.ok || !purchasePrice.ok) {
      setSubmitted(true)
      return
    }
    onSubmit?.({ ...data, quantity: quantity.value, purchasePrice: purchasePrice.value })
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)} aria-label={mode === 'add' ? t('addPosition') : t('editPosition')}>
      <div className="space-y-1">
        <label htmlFor="pos-ticker" className="kicker">{t('ticker')}</label>
        <input
          id="pos-ticker"
          type="text"
          value={data.ticker}
          onChange={(e) => setData((d) => ({ ...d, ticker: e.target.value.toUpperCase() }))}
          placeholder={t('tickerPlaceholder')}
          required
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="pos-qty" className="kicker">{t('quantity')}</label>
          <input
            id="pos-qty"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={data.quantity}
            onChange={(e) => setData((d) => ({ ...d, quantity: e.target.value }))}
            aria-invalid={quantityError != null}
            aria-describedby={quantityError != null ? 'pos-qty-error' : undefined}
            required
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring n"
          />
          {quantityError && (
            <p id="pos-qty-error" role="alert" className="text-xs font-medium text-destructive">
              {quantityError}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="pos-price" className="kicker">{t('purchasePrice')}</label>
          <input
            id="pos-price"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={data.purchasePrice}
            onChange={(e) => setData((d) => ({ ...d, purchasePrice: e.target.value }))}
            aria-invalid={priceError != null}
            aria-describedby={priceError != null ? 'pos-price-error' : undefined}
            required
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring n"
          />
          {priceError && (
            <p id="pos-price-error" role="alert" className="text-xs font-medium text-destructive">
              {priceError}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('cancel')}
          </Button>
        )}
        <Button type="submit">
          {mode === 'add' ? t('add') : t('save')}
        </Button>
      </div>
    </form>
  )
}
