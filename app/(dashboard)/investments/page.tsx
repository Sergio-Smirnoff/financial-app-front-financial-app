'use client'

import React from 'react'
import { useBffQuery } from '@/lib/hooks/useBffQuery'
import { PageFrame } from '@/components/ui-kit/layout/PageFrame'
import { InvestmentsContent } from '@/components/pages/investments/InvestmentsContent'

export default function InvestmentsPage() {
  const query = useBffQuery()

  return (
    <PageFrame>
      <InvestmentsContent query={query} />
    </PageFrame>
  )
}
