'use client'

import React from 'react'
import { useBffQuery } from '@/lib/hooks/useBffQuery'
import { OverviewContent } from '@/components/pages/overview/OverviewContent'

export default function DashboardPage() {
  const query = useBffQuery()

  return (
    <main className="flex-1 overflow-auto p-6">
      <OverviewContent query={query} />
    </main>
  )
}
