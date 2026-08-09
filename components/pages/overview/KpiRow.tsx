'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { KpiStrip, KpiTile } from '@/components/ui-kit/layout/KpiStrip'
import { Money } from '@/components/ui-kit/money/Money'
import type { Section } from '@/lib/api/bff/types'
import type { MoneyView } from '@/lib/format'

export interface KpiData {
  cash: MoneyView
  income: MoneyView
  expense: MoneyView
  committed: MoneyView
}

export interface KpiRowProps {
  section?: Section<KpiData>
  isLoading: boolean
  onRetry?: () => void
}

export function KpiRow({ section, isLoading, onRetry }: KpiRowProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-24 rounded-lg bg-muted animate-pulse" />}
    >
      {(data) => (
        <KpiStrip>
          <KpiTile label="Efectivo" value={<Money value={data.cash} />} />
          <KpiTile label="Ingresos" value={<Money value={data.income} tone="gain" />} />
          <KpiTile label="Gastos" value={<Money value={data.expense} tone="loss" />} />
          <KpiTile label="Comprometido" value={<Money value={data.committed} />} />
        </KpiStrip>
      )}
    </SectionState>
  )
}
