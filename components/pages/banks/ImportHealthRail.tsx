'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { StatusDot } from '@/components/ui-kit/row/StatusDot'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import type { components } from '@/lib/api/bff/schema'

type ImportHealthRow = components['schemas']['ImportHealthRowResponse']

export interface ImportHealthRailProps {
  rows?: ImportHealthRow[]
}

export function ImportHealthRail({ rows = [] }: ImportHealthRailProps) {
  const t = useTranslations('banks')

  return (
    <div data-testid="import-health-rail" className="elev-sm rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="section-head">{t('importHealth.title')}</h3>
        <Link href="/imports" className="text-xs text-primary hover:underline font-medium">
          {t('importHealth.importAction')} →
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{t('importHealth.empty')}</p>
          <Link href="/imports" className="text-xs text-primary underline">
            {t('importHealth.goToImports')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => {
            const isNever = r.status === 'NEVER' || !r.lastImportAt
            const isStale = r.status === 'STALE'

            return (
              <div key={r.cbu || r.alias} data-testid="import-health-row" data-row className="flex items-center justify-between gap-3 text-sm py-1 border-b last:border-b-0">
                <div className="flex items-center gap-2 min-w-0">
                  <StatusDot
                    tone={isNever ? 'neutral' : isStale ? 'warn' : 'ok'}
                    label={
                      isNever
                        ? t('importHealth.statusNever')
                        : isStale
                          ? t('importHealth.statusStale')
                          : t('importHealth.statusOk')
                    }
                  />
                  <span className="truncate font-medium">{r.alias || r.cbu}</span>
                </div>
                {r.lastImportAt ? (
                  <FreshnessStamp observedAt={r.lastImportAt} />
                ) : (
                  <Link href="/imports" className="text-xs text-muted-foreground hover:underline">
                    {t('importHealth.importAction')}
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
