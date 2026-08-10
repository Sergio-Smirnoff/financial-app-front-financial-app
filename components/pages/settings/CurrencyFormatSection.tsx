'use client'

import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleRow } from '@/components/ui-kit/controls/Toolbar'

export interface CurrencyFormatSectionProps {
  secondaryCurrency: string
  onSecondaryCurrencyChange: (val: string) => void
  decimals: string
  onDecimalsChange: (val: string) => void
  useColors: boolean
  onUseColorsChange: (val: boolean) => void
}

export function CurrencyFormatSection({
  secondaryCurrency,
  onSecondaryCurrencyChange,
  decimals,
  onDecimalsChange,
  useColors,
  onUseColorsChange,
}: CurrencyFormatSectionProps) {
  const formattedPreview = decimals === '0' ? '$ 1.284.000' : '$ 1.284.000,00'

  return (
    <div id="currency" className="elev-sm rounded-xl border bg-card p-6 space-y-6">
      <h3 className="section-head">Moneda y Formato</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="sec-curr-select" className="text-sm font-medium">Moneda secundaria</label>
          <Select value={secondaryCurrency} onValueChange={onSecondaryCurrencyChange}>
            <SelectTrigger id="sec-curr-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ninguna</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="decimals-select" className="text-sm font-medium">Decimales</label>
          <Select value={decimals} onValueChange={onDecimalsChange}>
            <SelectTrigger id="decimals-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 decimales (,00)</SelectItem>
              <SelectItem value="0">Sin decimales</SelectItem>
            </SelectContent>
          </Select>
          <div data-testid="format-preview" className="text-xs text-muted-foreground pt-1 font-mono">
            Vista previa: {formattedPreview}
          </div>
        </div>
      </div>

      <ToggleRow
        id="use-colors-toggle"
        label="Usar verde y rojo para importes"
        description="Resaltar ingresos en verde y egresos en rojo. Al desactivar, los colores se mantienen neutros."
        checked={useColors}
        onCheckedChange={onUseColorsChange}
      />
    </div>
  )
}
