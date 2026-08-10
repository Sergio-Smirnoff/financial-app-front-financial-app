'use client'

import React from 'react'
import { useImportsPage } from '@/lib/hooks/useImportsPage'
import { SplitLayout, RailSection } from '@/components/ui-kit/layout/KpiStrip'
import { FileProgress } from '@/components/ui-kit/page/imports/FileProgress'
import { ImportHistoryTable } from './ImportHistoryTable'
import { ReconciliationCard } from './ReconciliationCard'
import { ImportWizard } from './ImportWizard'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import { useQueryClient } from '@tanstack/react-query'
import type { BffQuery, ImportsBff } from '@/lib/api/bff/types'

export interface ImportsContentProps {
  query?: BffQuery
  initialData?: ImportsBff
}

export function ImportsContent({ query }: ImportsContentProps) {
  const queryClient = useQueryClient()
  const { data, isLoading, refetch } = useImportsPage()

  const historySection = data?.history
  const historyItems = historySection?.data ?? []

  const activeRun = {
    fileName: 'resumen-julio.csv',
    progress: 120,
    status: 'uploading' as const,
  }

  const handleUndo = async (id: string) => {
    await queryClient.invalidateQueries({ queryKey: ['bff', 'imports'] })
    await queryClient.invalidateQueries({ queryKey: ['bff', 'banks'] })
    await queryClient.invalidateQueries({ queryKey: ['bff', 'transactions'] })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Importaciones</h1>
          <p className="text-sm text-muted-foreground">Importación de extractos bancarios y archivos CSV</p>
        </div>
        {historySection?.observedAt && <FreshnessStamp observedAt={historySection.observedAt} />}
      </div>

      {activeRun && (
        <div className="p-4 rounded-xl border bg-card space-y-2">
          <span className="text-sm font-medium">Importación en progreso</span>
          <FileProgress
            fileName={activeRun.fileName}
            progress={activeRun.progress}
            status={activeRun.status}
          />
        </div>
      )}

      <SplitLayout
        main={
          <div className="space-y-6">
            <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
              <h3 className="section-head">Asistente de Importación</h3>
              <ImportWizard />
            </div>

            <ImportHistoryTable
              section={historySection}
              isLoading={isLoading}
              onRetry={refetch}
              onUndo={handleUndo}
            />
          </div>
        }
        rail={
          <div className="space-y-6">
            <RailSection title="Verificación">
              <ReconciliationCard matched={true} difference={0} hasBalanceColumn={true} />
            </RailSection>
          </div>
        }
      />
    </div>
  )
}
