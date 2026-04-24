'use client'

import { usePortfolioSummary, usePortfolioHoldings } from '@/lib/hooks/useInvestments'
import { PortfolioSummaryCard } from './PortfolioSummaryCard'
import { AllocationChart } from './AllocationChart'
import { HoldingTypeBreakdown } from './HoldingTypeBreakdown'
import { TopMovers } from '@/components/pages/dashboard/TopMovers'
import { ActiveAlertsCard } from './ActiveAlertsCard'
import { PortfolioPerformanceChart } from './PortfolioPerformanceChart'
import { MarketDiscoveryCard } from './MarketDiscoveryCard'
import { QueryBoundary } from '@/components/shared/QueryBoundary'

export function InvestmentsDashboard({ enabled = true }: { enabled?: boolean }) {
  const { data: summary, isLoading, isError, error } = usePortfolioSummary({ enabled })
  const { data: holdings = [] } = usePortfolioHoldings({ enabled })

  return (
    <QueryBoundary isLoading={isLoading} isError={isError || (!summary && !isLoading)} error={error}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left/Main Column */}
            <div className="lg:col-span-2 space-y-4">
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

            {/* Right/Sidebar Column */}
            <div className="space-y-4">
                <ActiveAlertsCard holdings={holdings} />
                <PortfolioPerformanceChart />
                <MarketDiscoveryCard />
            </div>
        </div>
    </QueryBoundary>
  )
}
