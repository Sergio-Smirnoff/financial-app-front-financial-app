'use client'

import { PortfolioPerformanceChart } from './PortfolioPerformanceChart'

interface PerformanceTabProps {
  enabled?: boolean
  bankNumber?: string | null
}

export function PerformanceTab({ enabled }: PerformanceTabProps) {
  if (!enabled) return null
  return <PortfolioPerformanceChart />
}
