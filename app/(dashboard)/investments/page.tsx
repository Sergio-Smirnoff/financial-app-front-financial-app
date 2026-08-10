'use client'

import React from 'react'
import { useQueryState } from 'nuqs'
import { InvestmentsContent } from '@/components/pages/investments/InvestmentsContent'

export default function InvestmentsPage() {
  const [currency] = useQueryState('currency', { defaultValue: 'ARS' })
  const [secondary] = useQueryState('secondary', { defaultValue: 'none' })

  return (
    <main className="flex-1 overflow-auto p-6">
      <InvestmentsContent query={{ currency, secondary }} />
    </main>
  )
}
