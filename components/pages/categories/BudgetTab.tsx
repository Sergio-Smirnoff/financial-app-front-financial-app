'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { ProgressRow } from '@/components/ui-kit/row/ProgressRow'
import { formatMoney } from '@/lib/format'
import type { Section } from '@/lib/api/bff/types'

export interface CategoryItem {
  id: number
  name: string
  icon: string
  color: string
  spendThisMonth: { amount: string; currency: string; secondary: null }
  budgetMonthly: { amount: string; currency: string; secondary: null } | null
}

export interface BudgetTabProps {
  section?: Section<CategoryItem[]>
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
          {categories.map((cat) => {
            const spent = parseFloat(cat.spendThisMonth.amount || '0')
            const budgetCap = cat.budgetMonthly ? parseFloat(cat.budgetMonthly.amount || '0') : 0
            const currencySymbol = cat.spendThisMonth.currency === 'USD' ? 'US$' : '$'
            const isOver = budgetCap > 0 && spent > budgetCap
            const isSelected = selectedCategoryId === cat.id

            return (
              <div
                key={cat.id}
                data-row
                onClick={() => onSelectCategory?.(cat.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{cat.name}</span>
                    {isOver && (
                      <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
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
