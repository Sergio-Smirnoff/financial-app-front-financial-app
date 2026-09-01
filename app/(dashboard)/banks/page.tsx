'use client'

import React from 'react'
import { useBffQuery } from '@/lib/hooks/useBffQuery'
import { BanksContent } from '@/components/pages/banks/BanksContent'

export default function BanksPage() {
  const query = useBffQuery()

  return (
    <main className="flex-1 overflow-y-auto p-6">
      <BanksContent query={query} />
    </main>
  )
}
