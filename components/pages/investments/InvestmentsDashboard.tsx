'use client'

import { usePortfolioSummary } from '@/lib/hooks/useInvestments'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { PortfolioSummaryCard } from './PortfolioSummaryCard'
import { AllocationChart } from './AllocationChart'

export function InvestmentsDashboard() {
  const { data: summary, isLoading, isError } = usePortfolioSummary()

  if (isLoading) return <LoadingSpinner />
  if (isError) return <ErrorMessage message="Failed to load portfolio summary." />

  if (!summary) return null

  return (
    <div className="space-y-4 max-w-4xl">
      <PortfolioSummaryCard summary={summary} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {summary.breakdownArs.length > 0 && (
          <AllocationChart breakdown={summary.breakdownArs} currency="ARS" />
        )}
        {summary.breakdownUsd.length > 0 && (
          <AllocationChart breakdown={summary.breakdownUsd} currency="USD" />
        )}
      </div>
    </div>
  )
}
