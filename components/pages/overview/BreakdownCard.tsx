'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { CompositionBar } from '@/components/charts/CompositionBar'
import { moneyText } from '@/components/ui-kit/money/Money'
import type { Section } from '@/lib/api/bff/types'
import { amountOf, type MoneyView } from '@/lib/format'

export interface BreakdownData {
  investments: MoneyView
  cash: MoneyView
  debt: MoneyView
  savings: MoneyView
}

export interface BreakdownCardProps {
  section?: Section<BreakdownData>
  isLoading: boolean
  onRetry?: () => void
}

export function BreakdownCard({ section, isLoading, onRetry }: BreakdownCardProps) {
  const t = useTranslations('overview')

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
    >
      {(data) => {
        const fmt = (m: MoneyView | null | undefined) => moneyText({ value: m })
        const invAmt = Math.max(0, amountOf(data.investments))
        const cashAmt = Math.max(0, amountOf(data.cash))
        const debtAmt = Math.max(0, amountOf(data.debt))
        const savAmt = Math.max(0, amountOf(data.savings))
        const total = invAmt + cashAmt + debtAmt + savAmt || 1

        const slices = [
          { label: t('breakdown.investments'), amount: fmt(data.investments), pct: (invAmt / total) * 100 },
          { label: t('cash'), amount: fmt(data.cash), pct: (cashAmt / total) * 100 },
          { label: t('breakdown.savings'), amount: fmt(data.savings), pct: (savAmt / total) * 100 },
          { label: t('breakdown.debt'), amount: fmt(data.debt), pct: (debtAmt / total) * 100 },
        ].filter((s) => s.pct > 0)

        return (
          <div className="elev-sm rounded-xl border bg-card p-5 space-y-4 short:space-y-2 short:p-4">
            <h3 className="section-head">{t('breakdownTitle')}</h3>
            <CompositionBar slices={slices} />
          </div>
        )
      }}
    </SectionState>
  )
}
