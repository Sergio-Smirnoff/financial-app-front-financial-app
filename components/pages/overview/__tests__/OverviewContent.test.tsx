import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { stubChartSize } from '@/test/chartSize'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { OverviewContent } from '../OverviewContent'
import type { OverviewBff } from '@/lib/api/bff/types'
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
      { id: 1, date: '2026-08-01', description: 'Supermercado Coto', accountCbu: '001', accountAlias: 'galicia.ars', categoryId: 1, categoryName: 'Comida', method: 'DEBIT', amount: { amount: '25000', currency: 'ARS', secondary: null }, direction: 'OUT' },
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
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      <QueryClientProvider client={queryClient}>
        <OverviewContent />
      </QueryClientProvider>
    </NextIntlClientProvider>
  )
}

describe('OverviewContent', () => {
  beforeEach(() => stubChartSize(640, 240))
  afterEach(() => vi.unstubAllGlobals())

  it('renders the four KPIs from the kpis section', () => {
    renderOverview(fixture)
    expect(screen.getAllByText('Efectivo')[0]).toBeInTheDocument()
    expect(screen.getAllByText(/1\.284\.000/)[0]).toBeInTheDocument()
  })

  it('degrades only the failing section', () => {
    const degraded: OverviewBff = {
      ...fixture,
      netWorth: { status: 'UNAVAILABLE', observedAt: NOW, data: null },
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
    const emptyMovements: OverviewBff = {
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

  it('lays the cards out as layout A: net worth, flow, committed, breakdown, then the rail', () => {
    renderOverview(fixture)
    const grid = screen.getByTestId('overview-grid')
    expect([...grid.children].map((child) => child.getAttribute('data-testid'))).toEqual([
      'overview-area-net-worth',
      'overview-area-flow',
      'overview-area-committed',
      'overview-area-breakdown',
      'overview-rail',
    ])
    expect(grid).toHaveClass('frame:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_330px]', 'frame:grid-rows-[minmax(0,1fr)_auto]')
    expect(screen.getByTestId('overview-rail')).toHaveClass('frame:col-start-3', 'frame:row-span-2')
  })

  it('puts the rail beside the cards only when the page content is at least 900px wide', () => {
    renderOverview(fixture)
    const grid = screen.getByTestId('overview-grid')
    expect(grid).toHaveClass('@min-[852px]/page:grid-cols-[minmax(0,1fr)_20rem]')
    expect(grid.className).not.toMatch(/(^|\s)(md|lg|xl):grid-cols-/)
    expect(screen.getByTestId('overview-rail')).toHaveClass('@min-[852px]/page:col-start-2', '@min-[852px]/page:row-span-4')
  })

  it('drops Flujo and Comprometido in the compact frame and puts the breakdown under net worth', () => {
    renderOverview(fixture)
    expect(screen.getByTestId('overview-grid')).toHaveClass('short:grid-cols-[minmax(0,1fr)_330px]')
    expect(screen.getByTestId('overview-area-flow')).toHaveClass('short:hidden')
    expect(screen.getByTestId('overview-area-committed')).toHaveClass('short:hidden')
    expect(screen.getByTestId('overview-area-breakdown')).toHaveClass('short:col-start-1')
    expect(screen.getByTestId('overview-rail')).toHaveClass('short:col-start-2')
  })

  it('keeps only the upcoming payments and a link to the movements in the compact rail', () => {
    renderOverview(fixture)
    expect(screen.getByTestId('overview-rail-spend')).toHaveClass('short:hidden')
    expect(screen.getByTestId('overview-rail-latest')).toHaveClass('short:hidden')
    const link = screen.getByTestId('overview-latest-link')
    expect(link).toHaveClass('hidden', 'short:inline-flex')
    expect(link).toHaveAttribute('href', '/transactions')
    expect(link).toHaveTextContent(esAR.overview.latest.more)
  })

  it('lists the latest movements as whole rows that never scroll or wrap their amount', () => {
    renderOverview(fixture)
    expect(screen.queryByRole('table', { name: esAR.overview.latest.caption })).not.toBeInTheDocument()
    expect(screen.getByTestId('latest-list')).toHaveClass('relative', 'min-h-0', 'overflow-hidden')
    const [row] = screen.getAllByTestId('latest-row')
    expect(row).toHaveTextContent('Supermercado Coto')
    expect(row.querySelector('.whitespace-nowrap')).toHaveTextContent(/25\.000,00/)
    expect(screen.getByTestId('latest-more')).toHaveTextContent(esAR.overview.latest.seeAll)
  })

  it('shows spend by category as amount and share, with no "/ max"', () => {
    renderOverview(fixture)
    expect(screen.getByText(/85\.000 · 36,9\s%/)).toBeInTheDocument()
    expect(screen.queryByText(/85000 \//)).not.toBeInTheDocument()
  })
})
