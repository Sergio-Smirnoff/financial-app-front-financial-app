'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { AlertMark } from '@/components/ui-kit/page/investments/AlertMark'
import type { Section } from '@/lib/api/bff/types'

export interface AlertItem {
  id: string
  ticker: string
  message: string
  tone: 'warn' | 'error' | 'info'
}

export interface AlertsRailProps {
  section?: Section<AlertItem[]>
  isLoading: boolean
  onRetry?: () => void
}

export function AlertsRail({ section, isLoading, onRetry }: AlertsRailProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-32 rounded-xl bg-muted animate-pulse" />}
    >
      {(alerts) => (
        <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
          <h3 className="section-head">Alertas de Mercado</h3>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin alertas activas.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((a) => (
                <div key={a.id} className="p-2.5 rounded-lg border bg-muted/30 space-y-1">
                  <span className="font-mono text-xs font-bold">{a.ticker}</span>
                  <div>
                    <AlertMark tone={a.tone} label={a.message} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </SectionState>
  )
}
