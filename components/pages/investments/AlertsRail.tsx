'use client'

import React from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import type { Section } from '@/lib/api/bff/types'

export interface AlertRow {
  id?: number
  title?: string
  message?: string
  createdAt?: string
  read?: boolean
}

export interface AlertsRailProps {
  section?: Section<AlertRow[]>
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
      {(alerts) => {
        const unreadCount = alerts.filter((a) => !a.read).length

        return (
          <div className="elev-sm rounded-xl border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="section-head">Alertas de Mercado</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-semibold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                  {unreadCount} sin leer
                </span>
              )}
            </div>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin alertas activas.</p>
            ) : (
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`p-2.5 rounded-lg border space-y-1 ${a.read ? 'bg-muted/20' : 'bg-muted/40 border-primary/20'}`}
                    data-testid="alert-row"
                  >
                    <span className="font-semibold text-xs">{a.title}</span>
                    <p className="text-xs text-muted-foreground">{a.message}</p>
                    {a.createdAt && (
                      <p className="text-[10px] text-muted-foreground/60">
                        {new Date(a.createdAt).toLocaleDateString('es-AR')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }}
    </SectionState>
  )
}
