'use client'

import React from 'react'
import { useBffQuery } from '@/lib/hooks/useBffQuery'
import { SettingsContent } from '@/components/pages/settings/SettingsContent'

export default function SettingsPage() {
  const query = useBffQuery()

  return (
    <main className="flex-1 overflow-auto p-6">
      <SettingsContent query={query} />
    </main>
  )
}
