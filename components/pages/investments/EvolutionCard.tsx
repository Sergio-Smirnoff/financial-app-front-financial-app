'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { AreaChart } from '@/components/charts/AreaChart'
import type { Section } from '@/lib/api/bff/types'

export interface EvolutionItem {
  date: string
  value: number
  cost: number
}

export interface EvolutionCardProps {
  section?: Section<EvolutionItem[]>
  isLoading: boolean
  onRetry?: () => void
}

export function EvolutionCard({ section, isLoading, onRetry }: EvolutionCardProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
    >
      {(items) => {
        const points = items.map((i) => ({ date: i.date, value: i.value }))
        const comparisonPoints = items.map((i) => ({ date: i.date, value: i.cost }))

        return (
          <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="section-head">Evolución de Cartera</h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Valor total
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full border border-dashed border-current" /> Costo invertido
                </span>
              </div>
            </div>

            <AreaChart
              data={points}
              comparisonData={comparisonPoints}
              ariaLabel="Evolución del valor de cartera y costo acumulado"
            />
          </div>
        )
      }}
    </SectionState>
  )
}
