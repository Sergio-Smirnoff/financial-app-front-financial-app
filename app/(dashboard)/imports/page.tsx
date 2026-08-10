'use client'

import React from 'react'
import { useQueryState } from 'nuqs'
import { ImportsContent } from '@/components/pages/imports/ImportsContent'

export default function ImportsPage() {
  const [currency] = useQueryState('currency', { defaultValue: 'ARS' })
  const [secondary] = useQueryState('secondary', { defaultValue: 'none' })

  return (
    <main className="flex-1 overflow-auto p-6">
      <ImportsContent query={{ currency, secondary }} />
    </main>
  )
}
