'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { Money } from '@/components/ui-kit/money/Money'
import { CompositionBar } from '@/components/charts/CompositionBar'
import { LegendList } from '@/components/charts/LegendList'
import { formatMoney } from '@/lib/format'
import type { Section } from '@/lib/api/bff/types'

interface PositionRow {
  holdingId?: number
  ticker?: string
  name?: string
  quantity?: number
  avgCost?: any
  price?: any
  marketValue?: any
  pnl?: any
  pnlPct?: number
  bankNumber?: string
}

interface CompositionSlice {
  label?: string
  amount?: any
  pct?: number
}

export interface PortfolioTabProps {
  positionsSection?: Section<PositionRow[]>
  compositionSection?: Section<CompositionSlice[]>
  isLoading: boolean
  onRetry?: () => void
}



export function PortfolioTab({
  positionsSection,
  compositionSection,
  isLoading,
  onRetry,
}: PortfolioTabProps) {
  const t = useTranslations('investments')
  const tc = useTranslations('common')
  const slices = compositionSection?.data?.map((a) => ({
    label: a.label ?? '',
    amount: a.amount ? formatMoney(a.amount) : '0',
    pct: a.pct ?? 0,
  })) ?? []

  return (
    <div className="space-y-6">
      <SectionState
        section={positionsSection}
        isLoading={isLoading}
        onRetry={onRetry}
        emptyTitle={t('tabs.positionsEmptyTitle')}
        emptyDescription={t('tabs.positionsEmptyDescription')}
        emptyTestId="positions-empty"
        skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
      >
        {(positions) => (
          <div className="space-y-4">
            <h3 className="section-head">{t('tabs.positionsHeading')}</h3>
            {positions.length === 0 ? (
              <p data-testid="positions-empty" className="text-sm text-muted-foreground">
                {t('tabs.positionsEmptyDescription')}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">{t('tabs.positionsCaption')}</caption>
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="py-2 px-2">{tc('ticker')}</th>
                      <th className="py-2 px-2">{t('tabs.colName')}</th>
                      <th className="py-2 px-2 text-right">{tc('quantity')}</th>
                      <th className="py-2 px-2 text-right">{t('tabs.colAvgCost')}</th>
                      <th className="py-2 px-2 text-right">{t('tabs.colPrice')}</th>
                      <th className="py-2 px-2 text-right">{t('shared.totalValue')}</th>
                      <th className="py-2 px-2 text-right">P&amp;L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((p: PositionRow) => (
                      <tr key={p.holdingId} data-testid="position-row" className="border-b last:border-0">
                        <td className="py-2 px-2">
                          <Link href={`/investments/holdings/${p.holdingId}`} className="font-mono font-semibold text-primary hover:underline">
                            {p.ticker}
                          </Link>
                        </td>
                        <td className="py-2 px-2">{p.name}</td>
                        <td className="py-2 px-2 text-right">{p.quantity}</td>
                        <td className="py-2 px-2 text-right"><Money value={p.avgCost} /></td>
                        <td className="py-2 px-2 text-right"><Money value={p.price} /></td>
                        <td className="py-2 px-2 text-right"><Money value={p.marketValue} /></td>
                        <td className="py-2 px-2 text-right">
                          <span className={p.pnlPct != null && p.pnlPct >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'}>
                            <Money value={p.pnl} /> ({p.pnlPct != null ? `${p.pnlPct >= 0 ? '+' : ''}${p.pnlPct.toFixed(2)}%` : '—'})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </SectionState>

      {slices.length > 0 && (
        <SectionState
          section={compositionSection}
          isLoading={isLoading}
          onRetry={onRetry}
          skeleton={<div className="h-32 rounded-xl bg-muted animate-pulse" />}
        >
          {(compSlices) => (
            <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
              <h3 className="section-head">{t('tabs.compositionHeading')}</h3>
              <CompositionBar slices={slices} />
              <LegendList slices={slices} />
            </div>
          )}
        </SectionState>
      )}
    </div>
  )
}
