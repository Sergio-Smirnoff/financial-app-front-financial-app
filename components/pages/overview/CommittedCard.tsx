'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { HorizonBars } from '@/components/charts/HorizonBars'
import type { OverviewBff, Section } from '@/lib/api/bff/types'

export type CommittedItem = NonNullable<NonNullable<OverviewBff['committed']>['data']>[number]

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
        const months = data.map((item) => ({
          month: item.month ?? '',
          amount: parseFloat(item.amount?.amount || '0'),
        }))
        const currency = data[0]?.amount?.currency ?? 'ARS'

        return (
          <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
            <h3 className="section-head">Gastos Comprometidos por Mes</h3>
            <HorizonBars months={months} currency={currency} ariaLabel="Gastos comprometidos por mes" />
          </div>
        )
      }}
    </SectionState>
  )
}
