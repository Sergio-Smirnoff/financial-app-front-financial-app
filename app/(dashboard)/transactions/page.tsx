'use client'

import React from 'react'
import { useBffQuery } from '@/lib/hooks/useBffQuery'
import { TransactionsContent } from '@/components/pages/transactions/TransactionsContent'

export default function TransactionsPage() {
  const query = useBffQuery()

  return (
    <main className="flex-1 overflow-auto p-6">
      <TransactionsContent query={query} />
    </main>
  )
}
