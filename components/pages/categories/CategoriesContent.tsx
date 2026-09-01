'use client'

import React from 'react'
import { useQueryState, parseAsInteger } from 'nuqs'
import { useTranslations } from 'next-intl'
import { useCategoriesPage } from '@/lib/hooks/useCategoriesPage'
import { KpiStrip, KpiTile, SplitLayout, RailSection } from '@/components/ui-kit/layout/KpiStrip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BudgetTab } from './BudgetTab'
import { RulesTab } from './RulesTab'
import { IncomeTab } from './IncomeTab'
import { CategoryTrendCard } from './CategoryTrendCard'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import { Money } from '@/components/ui-kit/money/Money'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { useQueryClient } from '@tanstack/react-query'
import type { BffQuery, CategoriesBff } from '@/lib/api/bff/types'

export interface CategoriesContentProps {
  query?: BffQuery
  initialData?: CategoriesBff
}

export function CategoriesContent({ query = { currency: 'ARS', secondary: 'none' } }: CategoriesContentProps) {
  const t = useTranslations('categories')
  const queryClient = useQueryClient()
  const [tab, setTab] = useQueryState('tab', { defaultValue: 'budget' })
  const [selectedCatId, setSelectedCatId] = useQueryState('categoryId', parseAsInteger)

  const { data, isLoading, refetch } = useCategoriesPage(query, selectedCatId)

  const kpis = data?.kpis
  const budgets = data?.budgets
  const selectedTrend = data?.selectedTrend
  const rules = data?.rules

  const selectedCategoryName = selectedCatId
    ? budgets?.data?.find((b) => b.categoryId === selectedCatId)?.name
    : undefined

  const handleAddRule = async (pattern: string, categoryId: number) => {
    await queryClient.invalidateQueries({ queryKey: ['bff', 'categories'] })
    await queryClient.invalidateQueries({ queryKey: ['bff', 'transactions'] })
  }

  const handleDeleteRule = async (id: number) => {
    await queryClient.invalidateQueries({ queryKey: ['bff', 'categories'] })
    await queryClient.invalidateQueries({ queryKey: ['bff', 'transactions'] })
  }

  const observedAt = budgets?.observedAt || kpis?.observedAt

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        {observedAt && <FreshnessStamp observedAt={observedAt} />}
      </div>

      <SectionState
        section={kpis}
        isLoading={isLoading}
        onRetry={refetch}
        skeleton={
          <KpiStrip>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
            ))}
          </KpiStrip>
        }
      >
        {(kpiData) => (
          <KpiStrip>
            <div data-testid="cat-kpi-spent">
              <KpiTile
                label={t('budget.accumulated')}
                value={kpiData.spent ? <Money value={kpiData.spent} /> : '—'}
              />
            </div>
            <div data-testid="cat-kpi-available">
              <KpiTile
                label={t('budget.available')}
                value={kpiData.available ? <Money value={kpiData.available} /> : '—'}
              />
            </div>
            <div data-testid="cat-kpi-over-count">
              <KpiTile label={t('budget.over')} value={String(kpiData.overBudgetCount ?? 0)} />
            </div>
            <div data-testid="cat-kpi-pace">
              <KpiTile label={t('pace')} value={`${(kpiData.pacePct ?? 0).toFixed(2)} %`} />
            </div>
          </KpiStrip>
        )}
      </SectionState>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="budget">{t('tabs.budget')}</TabsTrigger>
          <TabsTrigger value="rules">{t('tabs.rules')}</TabsTrigger>
          <TabsTrigger value="income">{t('tabs.income')}</TabsTrigger>
        </TabsList>

        <SplitLayout
          main={
            <div className="space-y-6">
              <TabsContent value="budget" className="m-0 focus-visible:outline-none">
                <BudgetTab
                  section={budgets}
                  isLoading={isLoading}
                  onRetry={refetch}
                  selectedCategoryId={selectedCatId}
                  onSelectCategory={(id) => setSelectedCatId(selectedCatId === id ? null : id)}
                />
              </TabsContent>

              <TabsContent value="rules" className="m-0 focus-visible:outline-none">
                <RulesTab
                  section={rules}
                  isLoading={isLoading}
                  onRetry={refetch}
                  categories={(budgets?.data ?? [])
                    .filter((b) => b.categoryId != null && b.name != null)
                    .map((b) => ({ id: b.categoryId!, name: b.name! }))}
                  onAddRule={handleAddRule}
                  onDeleteRule={handleDeleteRule}
                />
              </TabsContent>

              <TabsContent value="income" className="m-0 focus-visible:outline-none">
                <IncomeTab section={budgets} isLoading={isLoading} onRetry={refetch} />
              </TabsContent>
            </div>
          }
          rail={
            <div className="space-y-6">
              <RailSection title={t('railTitle')}>
                <CategoryTrendCard
                  categoryName={selectedCategoryName}
                  points={selectedTrend?.data?.points ?? []}
                />
              </RailSection>
            </div>
          }
        />
      </Tabs>
    </div>
  )
}
