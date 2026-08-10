'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { FeeTable } from '@/components/ui-kit/data/FeeTable'
import type { Section } from '@/lib/api/bff/types'

export interface FeeItem {
  scope: string
  label: string
  amount: any
  pct: number | null
  ivaTreatment: string
}

export interface FeesSectionProps {
  section?: Section<FeeItem[]>
  isLoading: boolean
  onRetry?: () => void
}

export function FeesSection({ section, isLoading, onRetry }: FeesSectionProps) {
  const defaultFees: FeeItem[] = [
    { scope: 'Cuentas', label: 'Mantenimiento mensual', amount: { amount: '2500', currency: 'ARS', secondary: null }, pct: null, ivaTreatment: 'TAXED_21' },
    { scope: 'Tarjetas', label: 'Comisión por renovación', amount: { amount: '12000', currency: 'ARS', secondary: null }, pct: null, ivaTreatment: 'TAXED_21' },
  ]

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
    >
      {() => (
        <div id="fees" className="elev-sm rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="section-head">Comisiones y Costos</h3>
            <span className="text-xs text-muted-foreground font-mono">Impuesto débito/crédito: 0,60 %</span>
          </div>

          <div role="rowgroup" aria-label="Cuentas">
            <FeeTable rows={defaultFees} />
          </div>
        </div>
      )}
    </SectionState>
  )
}
