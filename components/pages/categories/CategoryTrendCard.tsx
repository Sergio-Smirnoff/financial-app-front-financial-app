'use client'

import React from 'react'
import { Sparkline } from '@/components/charts/Sparkline'
import type { components } from '@/lib/api/bff/schema'

export type CategoryTrendPointResponse = components['schemas']['CategoryTrendPointResponse']

export interface CategoryTrendCardProps {
  categoryName?: string
  points?: CategoryTrendPointResponse[] | number[]
}

export function CategoryTrendCard({ categoryName, points = [] }: CategoryTrendCardProps) {
  if (!categoryName) {
    return (
      <div className="elev-sm rounded-xl border bg-card p-5 space-y-2">
        <h3 className="section-head">Tendencia</h3>
        <p className="text-sm text-muted-foreground">Seleccioná una categoría para ver su tendencia mensual.</p>
      </div>
    )
  }

  const series = points.map((p, idx) => {
    if (typeof p === 'number') {
      return { date: `2026-0${(idx % 9) + 1}-01`, value: p }
    }
    const val = p.amount?.amount ? parseFloat(p.amount.amount) : 0
    const d = p.month ? (p.month.length === 7 ? `${p.month}-01` : p.month) : `2026-0${(idx % 9) + 1}-01`
    return { date: d, value: val }
  })

  return (
    <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
      <h3 className="section-head">Tendencia {categoryName}</h3>
      {series.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin datos históricos suficientes.</p>
      ) : (
        <div className="py-2" role="img" aria-label={`Tendencia ${categoryName}`}>
          <Sparkline series={series} ariaLabel={`Tendencia ${categoryName}`} height={60} />
        </div>
      )}
    </div>
  )
}
