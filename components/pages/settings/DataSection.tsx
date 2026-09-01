'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export function DataSection() {
  const t = useTranslations('settings')

  return (
    <div id="data" className="elev-sm rounded-xl border bg-card p-6 space-y-6">
      <h3 className="section-head">{t('data.title')}</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-muted/20">
          <div className="space-y-0.5">
            <span className="text-sm font-medium">{t('data.export.label')}</span>
            <p className="text-xs text-muted-foreground">{t('data.export.description')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {t('data.soon')}
            </span>
            <Button disabled size="sm">
              {t('data.export.button')}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
          <div className="space-y-0.5">
            <span className="text-sm font-medium text-destructive">{t('data.deleteAccount')}</span>
            <p className="text-xs text-muted-foreground">{t('data.delete.description')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {t('data.soon')}
            </span>
            <Button disabled variant="destructive" size="sm">
              {t('data.deleteAccount')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
