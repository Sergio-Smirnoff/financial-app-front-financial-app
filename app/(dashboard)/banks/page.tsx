'use client'

import React from 'react'
import { useQueryState } from 'nuqs'
import { BanksContent } from '@/components/pages/banks/BanksContent'

export default function BanksPage() {
  const [currency] = useQueryState('currency', { defaultValue: 'ARS' })
  const [secondary] = useQueryState('secondary', { defaultValue: 'none' })

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <BanksContent query={{ currency, secondary }} />
    </main>
  )
}
