'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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
  const [data, setData] = React.useState<PositionFormData>({
    ticker: '',
    quantity: '',
    purchasePrice: '',
    currency: 'ARS',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit?.(data)
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)} aria-label={mode === 'add' ? 'Agregar posición' : 'Editar posición'}>
      <div className="space-y-1">
        <label htmlFor="pos-ticker" className="kicker">Ticker</label>
        <input
          id="pos-ticker"
          type="text"
          value={data.ticker}
          onChange={(e) => setData((d) => ({ ...d, ticker: e.target.value.toUpperCase() }))}
          placeholder="p.ej. GGAL"
          required
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="pos-qty" className="kicker">Cantidad</label>
          <input
            id="pos-qty"
            type="number"
            min="0"
            step="any"
            value={data.quantity}
            onChange={(e) => setData((d) => ({ ...d, quantity: e.target.value }))}
            required
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring n"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="pos-price" className="kicker">Precio de compra</label>
          <input
            id="pos-price"
            type="number"
            min="0"
            step="any"
            value={data.purchasePrice}
            onChange={(e) => setData((d) => ({ ...d, purchasePrice: e.target.value }))}
            required
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring n"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">
          {mode === 'add' ? 'Agregar' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
