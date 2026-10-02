import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { SpendByCategoryCard } from '../SpendByCategoryCard'
import type { SpendCategoryItem } from '../SpendByCategoryCard'
import type { Section } from '@/lib/api/bff/types'

const NOW = new Date().toISOString()

function renderCard(data: SpendCategoryItem[]) {
  const section: Section<SpendCategoryItem[]> = { status: 'OK', observedAt: NOW, data }
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      <SpendByCategoryCard section={section} isLoading={false} />
    </NextIntlClientProvider>
  )
}

describe('SpendByCategoryCard', () => {
  it('shows each category as amount · share, without a cap', () => {
    const { container } = renderCard([
      { categoryId: 1, name: 'expensas', amount: { amount: '87000000', currency: 'ARS' }, pct: 98.7 },
      { categoryId: 2, name: 'Inversiones', amount: { amount: '1119611.57', currency: 'ARS' }, pct: 1.3 },
    ])
    expect(screen.getByText(/87\.000\.000 · 98,7\s%/)).toBeInTheDocument()
    expect(screen.getByText(/1\.119\.612 · 1,3\s%/)).toBeInTheDocument()
    expect(container).not.toHaveTextContent(' / ')
  })

  it('shows the primary amount only, never the secondary currency', () => {
    renderCard([
      {
        categoryId: 1,
        name: 'Comida',
        amount: { amount: '85000', currency: 'ARS', secondary: { amount: '70', currency: 'USD' } },
        pct: 36.9,
      },
    ])
    expect(screen.getByText(/85\.000 · 36,9\s%/)).toBeInTheDocument()
    expect(screen.queryByText(/US\$/)).not.toBeInTheDocument()
  })

  it('treats a missing share as zero instead of inventing a cap', () => {
    renderCard([{ categoryId: 3, name: 'Otros', amount: { amount: '100', currency: 'ARS' } }])
    expect(screen.getByText(/100 · 0,0\s%/)).toBeInTheDocument()
  })
})
