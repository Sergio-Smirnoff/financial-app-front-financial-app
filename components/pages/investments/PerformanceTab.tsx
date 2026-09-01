'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

export function PerformanceTab() {
  const t = useTranslations('investments')

  return (
    <div className="p-4 rounded-lg border bg-card text-muted-foreground text-sm">
      {t('tabs.performancePlaceholder')}
    </div>
  )
}
