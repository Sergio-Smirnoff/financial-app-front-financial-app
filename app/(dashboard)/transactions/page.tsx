'use client'

import React from 'react'
import { useQueryState } from 'nuqs'
import { TransactionsContent } from '@/components/pages/transactions/TransactionsContent'

export default function TransactionsPage() {
  const [currency] = useQueryState('currency', { defaultValue: 'ARS' })
  const [secondary] = useQueryState('secondary', { defaultValue: 'none' })

  return (
    <main className="flex-1 overflow-auto p-6">
      <TransactionsContent query={{ currency, secondary }} />
    </main>
  )
}
