'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { useFitCount } from '@/lib/hooks/useFitCount'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
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
  className?: string
}

export function AlertsRail({ section, isLoading, onRetry, className }: AlertsRailProps) {
  const t = useTranslations('investments')
  const alerts = section?.data ?? []
  const { ref, count, framed } = useFitCount<HTMLUListElement>(alerts.length)
  const none = framed && count === 0 && alerts.length > 0
  const unreadCount = alerts.filter((a) => !a.read).length

  return (
    <div data-testid="alerts-card" className={cn('elev-sm flex min-h-0 flex-col gap-3 rounded-xl border bg-card p-5 max-md:p-3.5 short:p-4', className)}>
      <div className="flex h-5 shrink-0 items-center justify-between gap-4">
        <h3 className={cn('section-head', none && 'sr-only')}>{t('alerts.title')}</h3>
        {unreadCount > 0 && (
          <span className="whitespace-nowrap rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
            {t('alerts.unreadCount', { count: unreadCount })}
          </span>
        )}
      </div>
      <SectionState
        section={section}
        isLoading={isLoading}
        onRetry={onRetry}
        emptyTitle={t('alerts.empty')}
        boxClassName="border-0 bg-transparent p-4"
        skeleton={<div className="h-32 rounded-lg bg-muted animate-pulse" />}
      >
        {(rows) => (
          <>
            <ul ref={ref} data-testid="alerts-list" className="relative min-h-0 space-y-2 overflow-hidden frame:flex-1">
              {rows.map((a, index) => (
                <li
                  key={a.id ?? index}
                  hidden={index >= count}
                  data-testid="alert-row"
                  className={cn('space-y-1 rounded-lg border p-2.5', a.read ? 'bg-muted/20' : 'border-primary/20 bg-muted/40')}
                >
                  <span className="text-xs font-semibold">{a.title}</span>
                  <p className="text-xs text-muted-foreground">{a.message}</p>
                  {a.createdAt && (
                    <p className="text-[10px] text-muted-foreground/60">{formatDate(a.createdAt)}</p>
                  )}
                </li>
              ))}
            </ul>
            {none && (
              <p data-testid="alerts-hidden" className="text-xs text-muted-foreground">
                {t('alerts.hiddenCount', { count: rows.length })}
              </p>
            )}
          </>
        )}
      </SectionState>
    </div>
  )
}
