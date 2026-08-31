'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
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

const CATEGORY_KEYS = [
  'PAYMENT_DUE',
  'BUDGET',
  'PORTFOLIO_ALERTS',
  'SUMMARY',
  'IMPORT_HEALTH',
  'ACCOUNT',
  'SYSTEM',
] as const

export function NotificationsSection({ section, isLoading, onRetry }: NotificationsSectionProps) {
  const t = useTranslations('settings')

  const categoryLabels: Record<string, string> = React.useMemo(
    () => Object.fromEntries(CATEGORY_KEYS.map((key) => [key, t(`notifications.categories.${key}`)])),
    [t],
  )

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-48 rounded-xl bg-muted animate-pulse" />}
    >
      {(prefs: any) => (
        <div id="notifications" className="elev-sm rounded-xl border bg-card p-6 space-y-6">
          <h3 className="section-head">{t('notifications.title')}</h3>

          <div className="space-y-4">
            {((prefs as any[]) ?? []).map((pref: any) => {
              const label = categoryLabels[pref.category ?? ''] ?? pref.category ?? t('notifications.fallbackLabel')
              const channelsText = pref.channels?.length
                ? pref.channels.join(', ')
                : t('notifications.noChannels')
              return (
                <div
                  key={pref.category}
                  data-testid="notification-pref-row"
                  className="rounded-lg border bg-card px-3"
                >
                  <ToggleRow
                    id={`notification-toggle-${pref.category}`}
                    label={label}
                    description={t('notifications.activeChannels', { channels: channelsText })}
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
