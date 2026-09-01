'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { KpiStrip, KpiTile } from '@/components/ui-kit/layout/KpiStrip'
import { Money } from '@/components/ui-kit/money/Money'
import { formatDate } from '@/lib/format'
import type { Section, LoansKpis } from '@/lib/api/bff/types'

const ABSENT = '—'

export interface LoanKpisProps {
  section?: Section<LoansKpis>
  isLoading: boolean
  onRetry?: () => void
}

export function LoanKpis({ section, isLoading, onRetry }: LoanKpisProps) {
  const t = useTranslations('loans')

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-24 rounded-lg bg-muted animate-pulse" />}
    >
      {(kpis) => (
        <KpiStrip>
          <div data-testid="loans-kpi-outstanding">
            <KpiTile
              label={t('kpis.totalOutstanding')}
              value={<Money value={kpis.totalOutstanding} />}
            />
          </div>
          <div data-testid="loans-kpi-monthly-payment">
            <KpiTile
              label={t('kpis.monthlyPayment')}
              value={<Money value={kpis.monthlyPayment} />}
            />
          </div>
          <div data-testid="loans-kpi-active">
            <KpiTile
              label={t('kpis.activeLoans')}
              value={kpis.activeLoans == null ? ABSENT : String(kpis.activeLoans)}
            />
          </div>
          <div data-testid="loans-kpi-next-due">
            <KpiTile
              label={t('kpis.nextDue')}
              value={kpis.nextDueDate ? formatDate(kpis.nextDueDate) : ABSENT}
            />
          </div>
        </KpiStrip>
      )}
    </SectionState>
  )
}
