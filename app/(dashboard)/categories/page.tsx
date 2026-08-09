'use client'

import React from 'react'
import { useQueryState } from 'nuqs'
import { CategoriesContent } from '@/components/pages/categories/CategoriesContent'

export default function CategoriesPage() {
  const [currency] = useQueryState('currency', { defaultValue: 'ARS' })
  const [secondary] = useQueryState('secondary', { defaultValue: 'none' })

  return (
    <main className="flex-1 overflow-auto p-6">
      <CategoriesContent query={{ currency, secondary }} />
    </main>
  )
}
