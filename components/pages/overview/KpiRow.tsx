'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('overview')

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-24 rounded-lg bg-muted animate-pulse" />}
    >
      {(data) => (
        <KpiStrip>
          <div data-testid="overview-kpi-cash">
            <KpiTile label={t('cash')} value={<Money value={data.cash} />} />
          </div>
          <div data-testid="overview-kpi-income">
            <KpiTile label={t('income')} value={<Money value={data.income} tone="gain" />} />
          </div>
          <div data-testid="overview-kpi-expense">
            <KpiTile label={t('expense')} value={<Money value={data.expense} tone="loss" />} />
          </div>
          <div data-testid="overview-kpi-committed">
            <KpiTile label={t('committed')} value={<Money value={data.committed} />} />
          </div>
        </KpiStrip>
      )}
    </SectionState>
  )
}
