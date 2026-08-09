'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { HorizonBars } from '@/components/charts/HorizonBars'
import type { Section } from '@/lib/api/bff/types'
import type { MoneyView } from '@/lib/format'

export interface CommittedItem {
  month: string
  amount: MoneyView
}

export interface CommittedCardProps {
  section?: Section<CommittedItem[]>
  isLoading: boolean
  onRetry?: () => void
}

export function CommittedCard({ section, isLoading, onRetry }: CommittedCardProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
    >
      {(data) => {
        const items = data.map((item) => ({
          label: item.month,
          value: parseFloat(item.amount.amount || '0'),
          formatted: `${item.amount.currency === 'USD' ? 'US$' : '$'} ${parseFloat(item.amount.amount || '0').toLocaleString('es-AR')}`,
        }))

        return (
          <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
            <h3 className="section-head">Gastos Comprometidos por Mes</h3>
            <HorizonBars items={items} ariaLabel="Gastos comprometidos por mes" />
          </div>
        )
      }}
    </SectionState>
  )
}
