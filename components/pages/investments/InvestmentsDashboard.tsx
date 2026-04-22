'use client'

import { usePortfolioSummary, usePortfolioHoldings } from '@/lib/hooks/useInvestments'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { PortfolioSummaryCard } from './PortfolioSummaryCard'
import { AllocationChart } from './AllocationChart'
import { HoldingTypeBreakdown } from './HoldingTypeBreakdown'
import { TopMovers } from '@/components/pages/dashboard/TopMovers'

interface InvestmentsDashboardProps {
  enabled?: boolean
}

import { QueryBoundary } from '@/components/shared/QueryBoundary'

export function InvestmentsDashboard({ enabled = true }: InvestmentsDashboardProps) {
  const { data: summary, isLoading, isError, error } = usePortfolioSummary({ enabled })
  const { data: holdings = [] } = usePortfolioHoldings({ enabled })

  return (
    <QueryBoundary isLoading={isLoading} isError={isError || (!summary && !isLoading)} error={error}>
        <div className="space-y-4 max-w-4xl">
        {summary && <PortfolioSummaryCard summary={summary} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary?.breakdownArs && summary.breakdownArs.length > 0 && (
            <AllocationChart breakdown={summary.breakdownArs} currency="ARS" />
            )}
            {summary?.breakdownUsd && summary.breakdownUsd.length > 0 && (
            <AllocationChart breakdown={summary.breakdownUsd} currency="USD" />
            )}
            <HoldingTypeBreakdown />
        </div>

        <TopMovers holdings={holdings} />
        </div>
    </QueryBoundary>
  )
}
