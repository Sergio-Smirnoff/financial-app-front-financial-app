'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { Money } from '@/components/ui-kit/money/Money'
import type { Section } from '@/lib/api/bff/types'
import type { CategoryItem } from './BudgetTab'

export interface IncomeTabProps {
  section?: Section<CategoryItem[]>
  isLoading: boolean
  onRetry?: () => void
}

export function IncomeTab({ section, isLoading, onRetry }: IncomeTabProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />))}</div>}
    >
      {(categories) => {
        const incomeCategories = categories.filter((c) => parseFloat(c.spendThisMonth.amount || '0') > 0 || c.name.toLowerCase().includes('sueldo') || c.name.toLowerCase().includes('ingreso'))

        return (
          <div className="space-y-3">
            {incomeCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin ingresos registrados este mes.</p>
            ) : (
              incomeCategories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-card">
                  <span className="font-medium text-sm">{cat.name}</span>
                  <Money value={cat.spendThisMonth} tone="gain" className="text-sm font-semibold" />
                </div>
              ))
            )}
          </div>
        )
      }}
    </SectionState>
  )
}
