'use client'

import React from 'react'
import { ToggleRow } from '@/components/ui-kit/controls/Toolbar'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import type { components } from '@/lib/api/bff/schema'

type SectionResponseUserPreferencesResponse = components['schemas']['SectionResponseUserPreferencesResponse']

export interface CurrencyFormatSectionProps {
  section?: SectionResponseUserPreferencesResponse | any
  isLoading: boolean
  onRetry?: () => void
  primaryCurrency: string
  onPrimaryCurrencyChange: (val: string) => void
  secondaryCurrency: string
  onSecondaryCurrencyChange: (val: string) => void
  decimals: string
  onDecimalsChange: (val: string) => void
  useColors: boolean
  onUseColorsChange: (val: boolean) => void
}

export function CurrencyFormatSection({
  section,
  isLoading,
  onRetry,
  primaryCurrency,
  onPrimaryCurrencyChange,
  secondaryCurrency,
  onSecondaryCurrencyChange,
  decimals,
  onDecimalsChange,
  useColors,
  onUseColorsChange,
}: CurrencyFormatSectionProps) {
  const formattedPreview = decimals === '0' ? '$ 1.284.000' : '$ 1.284.000,00'

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
    >
      {() => (
        <div id="currency" className="elev-sm rounded-xl border bg-card p-6 space-y-6">
          <h3 className="section-head">Moneda y Formato</h3>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="primary-curr-select" className="text-sm font-medium">
                Moneda principal
              </label>
              <select
                id="primary-curr-select"
                data-testid="pref-primary-currency"
                value={primaryCurrency}
                onChange={(e) => onPrimaryCurrencyChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sec-curr-select" className="text-sm font-medium">
                Moneda secundaria
              </label>
              <select
                id="sec-curr-select"
                value={secondaryCurrency}
                onChange={(e) => onSecondaryCurrencyChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="none">Ninguna</option>
                <option value="null">Ninguna</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="decimals-select" className="text-sm font-medium">
                Decimales
              </label>
              <select
                id="decimals-select"
                data-testid="pref-decimals"
                value={decimals}
                onChange={(e) => onDecimalsChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="2">2 decimales (,00)</option>
                <option value="0">Sin decimales</option>
              </select>
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
      )}
    </SectionState>
  )
}
