'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { BarPairChart } from '@/components/charts/BarPairChart'
import type { Section } from '@/lib/api/bff/types'
import type { MoneyView } from '@/lib/format'

export interface FlowItem {
  month: string
  income: MoneyView
  expense: MoneyView
}

export interface FlowCardProps {
  section?: Section<FlowItem[]>
  isLoading: boolean
  onRetry?: () => void
}

export function FlowCard({ section, isLoading, onRetry }: FlowCardProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
    >
      {(data) => {
        const months = data.map((item) => ({
          month: item.month,
          income: parseFloat(item.income.amount || '0'),
          expense: parseFloat(item.expense.amount || '0'),
        }))

        const currency = data[0]?.income.currency || 'ARS'

        return (
          <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
            <h3 className="section-head">Flujo Mensual (Ingresos vs Gastos)</h3>
            <BarPairChart months={months} currency={currency} ariaLabel="Flujo mensual de ingresos y gastos" />
          </div>
        )
      }}
    </SectionState>
  )
}
