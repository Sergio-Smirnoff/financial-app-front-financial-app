'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Sparkline } from '@/components/charts/Sparkline'
import type { CategoriesBff } from '@/lib/api/bff/types'

export type CategoryTrendPointResponse = NonNullable<
  NonNullable<NonNullable<CategoriesBff['selectedTrend']>['data']>['points']
>[number]

export interface CategoryTrendCardProps {
  categoryName?: string
  points?: CategoryTrendPointResponse[] | number[]
}

export function CategoryTrendCard({ categoryName, points = [] }: CategoryTrendCardProps) {
  const t = useTranslations('categories')

  if (!categoryName) {
    return (
      <div className="elev-sm rounded-xl border bg-card p-5 space-y-2">
        <h3 className="section-head">{t('trend.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('trend.empty')}</p>
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
      <h3 className="section-head">{t('trend.titleFor', { name: categoryName })}</h3>
      {series.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('trend.noData')}</p>
      ) : (
        <div className="py-2" role="img" aria-label={t('trend.titleFor', { name: categoryName })}>
          <Sparkline series={series} ariaLabel={t('trend.titleFor', { name: categoryName })} height={60} />
        </div>
      )}
    </div>
  )
}
