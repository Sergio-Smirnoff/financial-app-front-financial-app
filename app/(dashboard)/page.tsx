'use client'

import React from 'react'
import { useQueryState } from 'nuqs'
import { OverviewContent } from '@/components/pages/overview/OverviewContent'

export default function DashboardPage() {
  const [currency] = useQueryState('currency', { defaultValue: 'ARS' })
  const [secondary] = useQueryState('secondary', { defaultValue: 'none' })

  return (
    <main className="flex-1 overflow-auto p-6">
      <OverviewContent query={{ currency, secondary }} />
    </main>
  )
}
