'use client'

import React from 'react'
import type { EvolutionRange } from '@/lib/api/bff/investments'
import type { AssetTypeSlice, EvolutionPoint, InvestmentsKpis, Section } from '@/lib/api/bff/types'
import { CompositionCard } from './CompositionCard'
import { EvolutionCard } from './EvolutionCard'
import { AlertsRail, type AlertRow } from './AlertsRail'

export interface ResumenTabProps {
  composition?: Section<AssetTypeSlice[]>
  kpis?: InvestmentsKpis | null
  evolution?: Section<EvolutionPoint[]>
  alerts?: Section<AlertRow[]>
  range: EvolutionRange
  onRangeChange: (range: EvolutionRange) => void
  isLoading: boolean
  onRetry?: () => void
}

export function ResumenTab({ composition, kpis, evolution, alerts, range, onRangeChange, isLoading, onRetry }: ResumenTabProps) {
  return (
    <div className="grid gap-4 max-md:gap-4.5 @min-[852px]/page:grid-cols-2 frame:h-full frame:min-h-0 frame:grid-cols-[minmax(300px,1.1fr)_1.7fr_300px] frame:grid-rows-[minmax(0,1fr)] short:gap-3">
      <CompositionCard section={composition} kpis={kpis} isLoading={isLoading} onRetry={onRetry} />
      <EvolutionCard section={evolution} kpis={kpis} range={range} onRangeChange={onRangeChange} isLoading={isLoading} onRetry={onRetry} />
      <div className="flex min-h-0 flex-col @min-[852px]/page:col-span-2 frame:col-span-1">
        <AlertsRail section={alerts} isLoading={isLoading} onRetry={onRetry} className="frame:h-full" />
      </div>
    </div>
  )
}
