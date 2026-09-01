'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

export function AlertsTab() {
  const t = useTranslations('investments')

  return (
    <div className="p-4 rounded-lg border bg-card text-muted-foreground text-sm">
      {t('alerts.tabPlaceholder')}
    </div>
  )
}
