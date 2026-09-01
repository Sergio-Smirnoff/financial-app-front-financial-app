'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { CompositionBar } from '@/components/charts/CompositionBar'
import { formatMoney } from '@/lib/format'
import type { Section } from '@/lib/api/bff/types'
import type { MoneyView } from '@/lib/format'

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
        const parseAmt = (m: MoneyView | null | undefined) => Math.max(0, parseFloat(m?.amount || '0'))
        const fmt = (m: MoneyView | null | undefined) => (m ? formatMoney(m) : '—')
        const invAmt = parseAmt(data.investments)
        const cashAmt = parseAmt(data.cash)
        const debtAmt = parseAmt(data.debt)
        const savAmt = parseAmt(data.savings)
        const total = invAmt + cashAmt + debtAmt + savAmt || 1

        const slices = [
          { label: t('breakdown.investments'), amount: fmt(data.investments), pct: (invAmt / total) * 100 },
          { label: t('cash'), amount: fmt(data.cash), pct: (cashAmt / total) * 100 },
          { label: t('breakdown.savings'), amount: fmt(data.savings), pct: (savAmt / total) * 100 },
          { label: t('breakdown.debt'), amount: fmt(data.debt), pct: (debtAmt / total) * 100 },
        ].filter((s) => s.pct > 0)

        return (
          <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
            <h3 className="section-head">{t('breakdownTitle')}</h3>
            <CompositionBar slices={slices} />
          </div>
        )
      }}
    </SectionState>
  )
}
