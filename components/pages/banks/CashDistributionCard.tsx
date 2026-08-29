'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { CompositionBar } from '@/components/charts/CompositionBar'
import { formatMoney } from '@/lib/format'
import type { BanksBff } from '@/lib/api/bff/types'

type CompositionSlice = NonNullable<NonNullable<BanksBff['cashDistribution']>['data']>[number]

export interface CashDistributionCardProps {
  slices?: CompositionSlice[]
}

export function CashDistributionCard({ slices = [] }: CashDistributionCardProps) {
  const t = useTranslations('banks')

  const formattedSlices = slices.map((s) => ({
    label: s.label || '',
    amount: s.amount || { amount: '0', currency: 'ARS', secondary: null },
    pct: s.pct ?? 0,
  }))

  return (
    <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
      <h3 className="section-head">{t('cashDistribution.title')}</h3>
      {formattedSlices.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('cashDistribution.empty')}</p>
      ) : (
        <CompositionBar slices={formattedSlices} />
      )}
    </div>
  )
}
