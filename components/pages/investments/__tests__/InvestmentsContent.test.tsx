import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { InvestmentsContent } from '../InvestmentsContent'
import fixture from '@/lib/api/bff/__fixtures__/investments.json'
import type { InvestmentsBff } from '@/lib/api/bff/types'

vi.mock('@/lib/hooks/useInvestmentsPage', () => ({
  useInvestmentsPage: vi.fn(),
}))

import { useInvestmentsPage } from '@/lib/hooks/useInvestmentsPage'

const bff = fixture as unknown as InvestmentsBff

import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'

function renderInvestments(data: InvestmentsBff) {
  vi.mocked(useInvestmentsPage).mockReturnValue({
    data,
    isLoading: false,
    refetch: vi.fn(),
  } as any)

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      <NuqsTestingAdapter>
        <QueryClientProvider client={queryClient}>
          <InvestmentsContent />
        </QueryClientProvider>
      </NuqsTestingAdapter>
    </NextIntlClientProvider>
  )
}

describe('InvestmentsContent renders the real contract', () => {
  it('renders portfolio kpis from the kpis section', () => {
    renderInvestments(bff)
    expect(screen.getByTestId('inv-kpi-market-value')).toBeInTheDocument()
    expect(screen.getByTestId('inv-kpi-pnl-pct')).toBeInTheDocument()
  })

  it('renders position rows when positions are present', () => {
    const withPositions = {
      ...bff,
      positions: {
        status: 'OK' as const,
        observedAt: new Date().toISOString(),
        data: [
          {
            holdingId: 42,
            ticker: 'YPFD',
            name: 'YPF S.A.',
            quantity: 100,
            avgCost: { amount: '12000', currency: 'ARS', secondary: null },
            price: { amount: '15000', currency: 'ARS', secondary: null },
            marketValue: { amount: '1500000', currency: 'ARS', secondary: null },
            pnl: { amount: '300000', currency: 'ARS', secondary: null },
            pnlPct: 25,
            bankNumber: '123',
          },
        ],
      },
    }
    renderInvestments(withPositions as any)
    const rows = screen.getAllByTestId('position-row')
    expect(rows).toHaveLength(1)
  })

  it('renders empty state when positions are empty', () => {
    const withoutPositions = {
      ...bff,
      positions: { ...bff.positions, data: [] },
    }
    renderInvestments(withoutPositions as any)
    expect(screen.getByTestId('positions-empty')).toBeInTheDocument()
  })

  it('degrades the market strip without failing the page', () => {
    const degraded = {
      ...bff,
      marketStrip: { status: 'UNAVAILABLE', observedAt: new Date().toISOString(), data: null },
    }
    renderInvestments(degraded as any)
    expect(screen.getByTestId('inv-kpi-market-value')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })
})
