'use client'

import { usePortfolioEvolution } from '@/lib/hooks/useInvestments'
import { AreaChart } from '@/components/charts/AreaChart'

interface PerformanceTabProps {
  enabled?: boolean
}

export function PerformanceTab({ enabled = true }: PerformanceTabProps) {
  const { data } = usePortfolioEvolution(30)
  if (!enabled) return null

  const series = (data ?? []).map((pt) => ({
    date: pt.date,
    value: pt.totalValueArs,
  }))

  return (
    <div className="rounded-2xl border border-border p-5 bg-card space-y-4">
      <h3 className="text-sm font-semibold">Evolución de Cartera</h3>
      <AreaChart
        series={series}
        currency="ARS"
        ariaLabel="Evolución de cartera"
      />
    </div>
  )
}
