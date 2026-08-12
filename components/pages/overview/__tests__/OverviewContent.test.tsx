import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { OverviewContent } from '../OverviewContent'
import type { OverviewBff, Section } from '@/lib/api/bff/types'
import React from 'react'

const NOW = new Date().toISOString()

const fixture: OverviewBff = {
  kpis: {
    status: 'OK',
    observedAt: NOW,
    data: {
      cash: { amount: '1284000', currency: 'ARS', secondary: null },
      income: { amount: '450000', currency: 'ARS', secondary: null },
      expense: { amount: '230000', currency: 'ARS', secondary: null },
      committed: { amount: '85000', currency: 'ARS', secondary: null },
    },
  },
  netWorth: {
    status: 'OK',
    observedAt: NOW,
    data: {
      series: [{ date: '2026-08-01', value: { amount: '1284000', currency: 'ARS', secondary: null } }],
      delta: { amount: { amount: '54000', currency: 'ARS', secondary: null }, pct: 4.38 },
      allTimeHigh: true,
    },
  },
  breakdown: {
    status: 'OK',
    observedAt: NOW,
    data: {
      investments: { amount: '500000', currency: 'ARS', secondary: null },
      cash: { amount: '784000', currency: 'ARS', secondary: null },
      debt: { amount: '0', currency: 'ARS', secondary: null },
      savings: { amount: '100000', currency: 'ARS', secondary: null },
    },
  },
  flow: {
    status: 'OK',
    observedAt: NOW,
    data: Array.from({ length: 12 }, (_, i) => ({
      month: `2026-${String(i + 1).padStart(2, '0')}`,
      income: { amount: '450000', currency: 'ARS', secondary: null },
      expense: { amount: '230000', currency: 'ARS', secondary: null },
    })),
  },
  committed: {
    status: 'OK',
    observedAt: NOW,
    data: [{ month: '2026-08', amount: { amount: '85000', currency: 'ARS', secondary: null } }],
  },
  upcomingPayments: {
    status: 'OK',
    observedAt: NOW,
    data: [
      { id: '1', label: 'Visa Galicia', dueDate: '15 Ago', amount: { amount: '45000', currency: 'ARS', secondary: null }, kind: 'card' },
    ],
  },
  spendByCategory: {
    status: 'OK',
    observedAt: NOW,
    data: [
      { categoryId: 1, name: 'Comida', amount: { amount: '85000', currency: 'ARS', secondary: null }, pct: 36.9 },
    ],
  },
  latestMovements: {
    status: 'OK',
    observedAt: NOW,
    data: [
      { id: 1, date: '2026-08-01', description: 'Supermercado Coto', accountCbu: '001', accountAlias: 'galicia.ars', categoryId: 1, categoryName: 'Comida', method: 'DEBIT', note: null, amount: { amount: '25000', currency: 'ARS', secondary: null }, direction: 'OUT' },
    ],
  },
}

vi.mock('@/lib/hooks/useOverviewPage', () => ({
  useOverviewPage: vi.fn(),
}))

import { useOverviewPage } from '@/lib/hooks/useOverviewPage'

function renderOverview(data: OverviewBff) {
  vi.mocked(useOverviewPage).mockReturnValue({
    data,
    isLoading: false,
    refetch: vi.fn(),
  } as any)

  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <OverviewContent />
    </QueryClientProvider>
  )
}

describe('OverviewContent', () => {
  it('renders the four KPIs from the kpis section', () => {
    renderOverview(fixture)
    expect(screen.getAllByText('Efectivo')[0]).toBeInTheDocument()
    expect(screen.getAllByText(/1\.284\.000/)[0]).toBeInTheDocument()
  })

  it('degrades only the failing section', () => {
    const degraded = {
      ...fixture,
      netWorth: { status: 'UNAVAILABLE', observedAt: NOW, data: null } as Section<any>,
    }
    renderOverview(degraded)
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    expect(screen.getAllByText('Efectivo')[0]).toBeInTheDocument()
  })

  it('marks an all-time high with text, not only colour', () => {
    renderOverview(fixture)
    expect(screen.getByText(/Máximo histórico/)).toBeInTheDocument()
  })

  it('renders 12 month pairs in the flow card', () => {
    renderOverview(fixture)
    expect(screen.getAllByTestId('bar-income')).toHaveLength(12)
  })

  it('offers the primary action only in the empty state', () => {
    const emptyMovements = {
      ...fixture,
      latestMovements: { status: 'OK', observedAt: NOW, data: [] },
    }
    renderOverview(emptyMovements)
    expect(screen.getByRole('button', { name: 'Registrar movimiento' })).toBeInTheDocument()
  })

  it('links each upcoming payment to its origin', () => {
    renderOverview(fixture)
    const link = screen.getByRole('link', { name: /Visa Galicia/ })
    expect(link).toHaveAttribute('href', '/banks')
  })
})
