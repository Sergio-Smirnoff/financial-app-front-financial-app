'use client'

import React from 'react'
import { useBffQuery } from '@/lib/hooks/useBffQuery'
import { InvestmentsContent } from '@/components/pages/investments/InvestmentsContent'

export default function InvestmentsPage() {
  const query = useBffQuery()

  return (
    <main className="flex-1 overflow-auto p-6">
      <InvestmentsContent query={query} />
    </main>
  )
}
