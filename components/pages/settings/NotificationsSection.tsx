'use client'

import React from 'react'
import { ToggleRow } from '@/components/ui-kit/controls/Toolbar'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import type { Section } from '@/lib/api/bff/types'
import type { components } from '@/lib/api/bff/schema'

type NotificationPreferenceResponse = components['schemas']['NotificationPreferenceResponse']

export interface NotificationsSectionProps {
  section?: any
  isLoading: boolean
  onRetry?: () => void
}

const CATEGORY_LABELS: Record<string, string> = {
  PAYMENT_DUE: 'Vencimiento de tarjetas y cuotas',
  BUDGET: 'Exceso de presupuesto',
  PORTFOLIO_ALERTS: 'Alertas de portafolio e inversiones',
  SUMMARY: 'Resumen periódico',
  IMPORT_HEALTH: 'Estado de importaciones',
  ACCOUNT: 'Alertas de cuenta',
  SYSTEM: 'Notificaciones del sistema',
}

export function NotificationsSection({ section, isLoading, onRetry }: NotificationsSectionProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
    >
      {(prefs: any) => (
        <div id="notifications" className="elev-sm rounded-xl border bg-card p-6 space-y-6">
          <h3 className="section-head">Notificaciones</h3>

          <div className="space-y-4">
            {((prefs as any[]) ?? []).map((pref: any) => {
              const label = CATEGORY_LABELS[pref.category ?? ''] ?? pref.category ?? 'Notificación'
              const channelsText = pref.channels?.length ? pref.channels.join(', ') : 'Ninguno'
              return (
                <div
                  key={pref.category}
                  data-testid="notification-pref-row"
                  className="rounded-lg border bg-card px-3"
                >
                  <ToggleRow
                    id={`notification-toggle-${pref.category}`}
                    label={label}
                    description={`Canales activos: ${channelsText}`}
                    checked={(pref.channels?.length ?? 0) > 0}
                    onCheckedChange={() => {}}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </SectionState>
  )
}
