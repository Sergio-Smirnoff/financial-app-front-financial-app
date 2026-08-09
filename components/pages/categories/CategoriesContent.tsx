'use client'

import React from 'react'
import { useQueryState, parseAsInteger } from 'nuqs'
import { useCategoriesPage } from '@/lib/hooks/useCategoriesPage'
import { KpiStrip, KpiTile, SplitLayout, RailSection } from '@/components/ui-kit/layout/KpiStrip'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BudgetTab } from './BudgetTab'
import { RulesTab } from './RulesTab'
import { IncomeTab } from './IncomeTab'
import { CategoryTrendCard } from './CategoryTrendCard'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import { useQueryClient } from '@tanstack/react-query'
import type { BffQuery, CategoriesBff } from '@/lib/api/bff/types'

export interface CategoriesContentProps {
  query?: BffQuery
  initialData?: CategoriesBff
}

export function CategoriesContent({ query = { currency: 'ARS', secondary: 'none' } }: CategoriesContentProps) {
  const queryClient = useQueryClient()
  const [tab, setTab] = useQueryState('tab', { defaultValue: 'budget' })
  const [selectedCatId, setSelectedCatId] = useQueryState('category', parseAsInteger)

  const { data, isLoading, refetch } = useCategoriesPage(query)

  const categoriesSection = data?.categories
  const categoriesList = categoriesSection?.data ?? []

  const selectedCategory = categoriesList.find((c) => c.id === selectedCatId)

  const mockRules = [
    { id: 1, pattern: 'UBER', categoryName: 'Transporte', matchCount: 12 },
    { id: 2, pattern: 'COTO', categoryName: 'Comida', matchCount: 45 },
  ]

  const handleAddRule = async (pattern: string, categoryId: number) => {
    await queryClient.invalidateQueries({ queryKey: ['bff', 'categories'] })
    await queryClient.invalidateQueries({ queryKey: ['bff', 'transactions'] })
  }

  const handleDeleteRule = async (id: number) => {
    await queryClient.invalidateQueries({ queryKey: ['bff', 'categories'] })
    await queryClient.invalidateQueries({ queryKey: ['bff', 'transactions'] })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorías y Presupuestos</h1>
          <p className="text-sm text-muted-foreground">Control presupuestario, asignación y reglas automáticas</p>
        </div>
        {categoriesSection?.observedAt && <FreshnessStamp observedAt={categoriesSection.observedAt} />}
      </div>

      <KpiStrip>
        <KpiTile label="Ritmo del mes" value="+68,00 %" subtext="Dentro del límite mensual" />
        <KpiTile label="Categorías con presupuesto" value={String(categoriesList.filter((c) => c.budgetMonthly).length)} />
        <KpiTile label="Gastos acumulados" value={`${query.currency === 'USD' ? 'US$' : '$'} 1.450.000`} />
        <KpiTile label="Reglas activas" value={String(mockRules.length)} />
      </KpiStrip>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="budget">Presupuesto</TabsTrigger>
          <TabsTrigger value="rules">Reglas</TabsTrigger>
          <TabsTrigger value="income">Ingresos</TabsTrigger>
        </TabsList>

        <SplitLayout
          main={
            <div className="space-y-6">
              <TabsContent value="budget" className="m-0 focus-visible:outline-none">
                <BudgetTab
                  section={categoriesSection}
                  isLoading={isLoading}
                  onRetry={refetch}
                  selectedCategoryId={selectedCatId}
                  onSelectCategory={(id) => setSelectedCatId(selectedCatId === id ? null : id)}
                />
              </TabsContent>

              <TabsContent value="rules" className="m-0 focus-visible:outline-none">
                <RulesTab
                  section={{ status: 'OK', observedAt: new Date().toISOString(), data: mockRules }}
                  isLoading={false}
                  categories={categoriesList.map((c) => ({ id: c.id, name: c.name }))}
                  onAddRule={handleAddRule}
                  onDeleteRule={handleDeleteRule}
                />
              </TabsContent>

              <TabsContent value="income" className="m-0 focus-visible:outline-none">
                <IncomeTab section={categoriesSection} isLoading={isLoading} onRetry={refetch} />
              </TabsContent>
            </div>
          }
          rail={
            <div className="space-y-6">
              <RailSection title="Análisis de Categoría">
                <CategoryTrendCard
                  categoryName={selectedCategory?.name}
                  points={selectedCategory ? [12, 18, 15, 25, 30, 22] : []}
                />
              </RailSection>
            </div>
          }
        />
      </Tabs>
    </div>
  )
}
