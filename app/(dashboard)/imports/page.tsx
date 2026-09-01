'use client'

import React from 'react'
import { useBffQuery } from '@/lib/hooks/useBffQuery'
import { ImportsContent } from '@/components/pages/imports/ImportsContent'

export default function ImportsPage() {
  const query = useBffQuery()

  return (
    <main className="flex-1 overflow-auto p-6">
      <ImportsContent query={query} />
    </main>
  )
}
