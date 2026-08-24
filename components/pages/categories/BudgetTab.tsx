'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { ProgressRow } from '@/components/ui-kit/row/ProgressRow'
import { formatMoney } from '@/lib/format'
import type { CategoriesBff, Section } from '@/lib/api/bff/types'

export type BudgetRow = NonNullable<NonNullable<CategoriesBff['budgets']>['data']>[number]

export interface BudgetTabProps {
  section?: Section<BudgetRow[]>
  isLoading: boolean
  onRetry?: () => void
  selectedCategoryId?: number | null
  onSelectCategory?: (id: number) => void
}

export function BudgetTab({
  section,
  isLoading,
  onRetry,
  selectedCategoryId,
  onSelectCategory,
}: BudgetTabProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => (<div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />))}</div>}
    >
      {(categories) => (
        <div className="space-y-3">
          {categories.map((cat: any) => {
            const spent = parseFloat(cat.spent?.amount || '0')
            const budgetCap = cat.cap ? parseFloat(cat.cap.amount || '0') : 0
            const currencySymbol = cat.spent?.currency === 'USD' ? 'US$' : '$'
            const isOver = cat.over ?? (budgetCap > 0 && spent > budgetCap)
            const catId = cat.categoryId ?? cat.id
            const isSelected = selectedCategoryId === catId

            return (
              <div
                key={catId || cat.name}
                data-testid="budget-row"
                onClick={() => catId && onSelectCategory?.(catId)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{cat.name}</span>
                    {isOver && (
                      <span data-testid="budget-over-flag" className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
                        Excedido
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {currencySymbol} {spent.toLocaleString('es-AR')} / {budgetCap > 0 ? `${currencySymbol} ${budgetCap.toLocaleString('es-AR')}` : 'Sin límite'}
                  </span>
                </div>
                {budgetCap > 0 && (
                  <ProgressRow
                    label={cat.name}
                    value={spent}
                    max={budgetCap}
                    caption={`${((spent / budgetCap) * 100).toFixed(0)} %`}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </SectionState>
  )
}
