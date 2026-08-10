'use client'

import React from 'react'
import { useQueryState } from 'nuqs'
import { SettingsContent } from '@/components/pages/settings/SettingsContent'

export default function SettingsPage() {
  const [currency] = useQueryState('currency', { defaultValue: 'ARS' })
  const [secondary] = useQueryState('secondary', { defaultValue: 'none' })

  return (
    <main className="flex-1 overflow-auto p-6">
      <SettingsContent query={{ currency, secondary }} />
    </main>
  )
}
