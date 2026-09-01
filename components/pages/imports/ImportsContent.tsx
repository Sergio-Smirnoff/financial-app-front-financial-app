'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useImportsPage } from '@/lib/hooks/useImportsPage'
import { SplitLayout, RailSection } from '@/components/ui-kit/layout/KpiStrip'
import { ImportHistoryTable } from './ImportHistoryTable'
import { ReconciliationCard } from './ReconciliationCard'
import { ImportWizard } from './ImportWizard'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { useQueryClient } from '@tanstack/react-query'
import type { BffQuery, ImportsBff } from '@/lib/api/bff/types'

export interface ImportsContentProps {
  query?: BffQuery
  initialData?: ImportsBff
}

function SkeletonTable() {
  return (
    <div className="space-y-3">
      <div className="h-6 w-48 rounded bg-muted animate-pulse" />
      <div className="h-48 rounded-xl bg-muted animate-pulse" />
    </div>
  )
}

function SkeletonCard() {
  return <div className="h-32 rounded-xl bg-muted animate-pulse" />
}

export function ImportsContent({ query }: ImportsContentProps) {
  const t = useTranslations('imports')
  const queryClient = useQueryClient()
  const { data, isLoading, refetch } = useImportsPage()

  const activeRun = data?.activeRun
  const history = data?.history
  const reconciliation = data?.reconciliation

  const activeData = activeRun?.data

  const handleUndo = async (runId: number) => {
    await queryClient.invalidateQueries({ queryKey: ['bff', 'imports'] })
    await queryClient.invalidateQueries({ queryKey: ['bff', 'banks'] })
    await queryClient.invalidateQueries({ queryKey: ['bff', 'transactions'] })
  }

  const observedAt = history?.observedAt || activeRun?.observedAt || reconciliation?.observedAt

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        {observedAt && <FreshnessStamp observedAt={observedAt} />}
      </div>

      {activeData && (
        <div data-testid="active-run-card" className="p-4 rounded-xl border bg-card space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('activeRun')}</span>
              {activeData.fileName && (
                <span className="text-sm text-muted-foreground">({activeData.fileName})</span>
              )}
            </div>
            {activeData.startedAt && <FreshnessStamp observedAt={activeData.startedAt} />}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('activeRunProcessed', { count: activeData.processed ?? 0 })}</span>
              <span>{t('activeRunTotal', { count: activeData.total ?? 0 })}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                role="progressbar"
                className="h-full bg-primary transition-all"
                style={{
                  width: `${
                    activeData.total && activeData.total > 0
                      ? Math.min(100, Math.round(((activeData.processed ?? 0) / activeData.total) * 100))
                      : 0
                  }%`,
                }}
                aria-valuenow={activeData.processed ?? 0}
                aria-valuemin={0}
                aria-valuemax={activeData.total ?? 100}
                aria-label={t('activeRunProgressLabel', {
                  fileName: activeData.fileName ?? t('activeRunUnnamedFile'),
                })}
              />
            </div>
          </div>
        </div>
      )}

      <SplitLayout
        main={
          <div className="space-y-6">
            <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
              <h3 className="section-head">{t('wizard.title')}</h3>
              <ImportWizard />
            </div>

            <SectionState
              section={history}
              isLoading={isLoading}
              onRetry={refetch}
              skeleton={<SkeletonTable />}
            >
              {(historyRows) => (
                <ImportHistoryTable rows={historyRows} onUndo={handleUndo} />
              )}
            </SectionState>
          </div>
        }
        rail={
          <div className="space-y-6">
            <RailSection title={t('reconcile.railTitle')}>
              <SectionState
                section={reconciliation}
                isLoading={isLoading}
                onRetry={refetch}
                skeleton={<SkeletonCard />}
              >
                {(reconciliationRows) => (
                  <ReconciliationCard rows={reconciliationRows} />
                )}
              </SectionState>
            </RailSection>
          </div>
        }
      />
    </div>
  )
}
