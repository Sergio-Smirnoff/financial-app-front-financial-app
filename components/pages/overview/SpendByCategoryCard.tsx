'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { ProgressRow } from '@/components/ui-kit/row/ProgressRow'
import type { OverviewBff, Section } from '@/lib/api/bff/types'

export type SpendCategoryItem = NonNullable<
  NonNullable<OverviewBff['spendByCategory']>['data']
>[number]

export interface SpendByCategoryCardProps {
  section?: Section<SpendCategoryItem[]>
  isLoading: boolean
  onRetry?: () => void
}

export function SpendByCategoryCard({ section, isLoading, onRetry }: SpendByCategoryCardProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
    >
      {(data) => (
        <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
          <h3 className="section-head">Gastos por Categoría</h3>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin gastos registrados este mes.</p>
          ) : (
            <div className="space-y-3">
              {data.map((item) => {
                const val = parseFloat(item.amount?.amount || '0')
                const pct = item.pct
                return (
                  <ProgressRow
                    key={item.categoryId}
                    label={item.name ?? ''}
                    value={val}
                    max={val > 0 ? (val * 100) / Math.max(1, pct ?? 0) : 100}
                    caption={pct != null ? `${pct.toFixed(1)} %` : undefined}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}
    </SectionState>
  )
}
