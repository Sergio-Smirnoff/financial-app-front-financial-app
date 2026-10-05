'use client'

import React from 'react'
import { useBffQuery } from '@/lib/hooks/useBffQuery'
import { OverviewContent } from '@/components/pages/overview/OverviewContent'
import { PageFrame } from '@/components/ui-kit/layout/PageFrame'

export default function DashboardPage() {
  const query = useBffQuery()

  return (
    <PageFrame>
      <OverviewContent query={query} />
    </PageFrame>
  )
}
