'use client'

import React from 'react'
import { useBffQuery } from '@/lib/hooks/useBffQuery'
import { CategoriesContent } from '@/components/pages/categories/CategoriesContent'

export default function CategoriesPage() {
  const query = useBffQuery()

  return (
    <main className="flex-1 overflow-auto p-6">
      <CategoriesContent query={query} />
    </main>
  )
}
