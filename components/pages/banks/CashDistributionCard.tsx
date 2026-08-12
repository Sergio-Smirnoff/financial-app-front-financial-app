'use client'

import React from 'react'
import { CompositionBar } from '@/components/charts/CompositionBar'
import { formatMoney } from '@/lib/format'
import type { components } from '@/lib/api/bff/schema'

type CompositionSlice = components['schemas']['CompositionSliceResponse']

export interface CashDistributionCardProps {
  slices?: CompositionSlice[]
}

export function CashDistributionCard({ slices = [] }: CashDistributionCardProps) {
  const formattedSlices = slices.map((s) => ({
    label: s.label || '',
    amount: s.amount || { amount: '0', currency: 'ARS', secondary: null },
    pct: s.pct ?? 0,
  }))

  return (
    <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
      <h3 className="section-head">Distribución de Saldos</h3>
      {formattedSlices.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin saldos registrados.</p>
      ) : (
        <CompositionBar slices={formattedSlices} />
      )}
    </div>
  )
}
