'use client'

import React from 'react'
import { Sparkline } from '@/components/charts/Sparkline'

export interface CategoryTrendCardProps {
  categoryName?: string
  points?: number[]
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

  return (
    <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
      <h3 className="section-head">Tendencia {categoryName}</h3>
      {points.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin datos históricos suficientes.</p>
      ) : (
        <div className="py-2" role="img" aria-label={`Tendencia ${categoryName}`}>
          <Sparkline data={points} ariaLabel={`Tendencia ${categoryName}`} height={60} />
        </div>
      )}
    </div>
  )
}
