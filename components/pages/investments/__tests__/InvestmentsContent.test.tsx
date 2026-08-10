import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InvestmentsContent } from '../InvestmentsContent'
import type { InvestmentsBff, Section } from '@/lib/api/bff/types'
import React from 'react'

const NOW = new Date().toISOString()

const fixture: InvestmentsBff = {
  summary: {
    status: 'OK',
    observedAt: NOW,
    data: {
      totalInvested: { amount: '1500000', currency: 'ARS', secondary: null },
      totalPnl: { amount: { amount: '250000', currency: 'ARS', secondary: null }, pct: 16.67 },
    },
  },
  holdings: {
    status: 'OK',
    observedAt: NOW,
    data: [
      {
        id: 42,
        ticker: 'YPFD',
        assetType: 'Acción',
        quantity: 100,
        avgPrice: { amount: '12000', currency: 'ARS', secondary: null },
        currentPrice: { amount: '15000', currency: 'ARS', secondary: null },
        totalValue: { amount: '1500000', currency: 'ARS', secondary: null },
        pnl: { amount: { amount: '300000', currency: 'ARS', secondary: null }, pct: 25 },
      },
    ],
  },
  allocation: {
    status: 'OK',
    observedAt: NOW,
    data: [
      { assetType: 'Acción', amount: { amount: '1500000', currency: 'ARS', secondary: null }, pct: 100 },
    ],
  },
}

vi.mock('@/lib/hooks/useInvestmentsPage', () => ({
  useInvestmentsPage: vi.fn(),
}))

import { useInvestmentsPage } from '@/lib/hooks/useInvestmentsPage'

function renderInvestments(data: InvestmentsBff) {
  vi.mocked(useInvestmentsPage).mockReturnValue({
    data,
    isLoading: false,
    refetch: vi.fn(),
  } as any)

  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <InvestmentsContent />
    </QueryClientProvider>
  )
}

describe('InvestmentsContent', () => {
  it('renders each quote with its own unit', () => {
    renderInvestments(fixture)
    expect(screen.getByText('−12 pts')).toBeInTheDocument()
    expect(screen.getByText('+1,20 %')).toBeInTheDocument()
  })

  it('stamps the strip with its own freshness', () => {
    renderInvestments(fixture)
    expect(within(screen.getByTestId('market-strip')).getByRole('status')).toBeInTheDocument()
  })

  it('renders positions with signed P&L and a link to the holding', () => {
    renderInvestments(fixture)
    const link = screen.getByRole('link', { name: 'YPFD' })
    expect(link).toHaveAttribute('href', '/investments/holdings/42')
  })

  it('draws the accumulated cost as a dashed comparison series', () => {
    const { container } = renderInvestments(fixture)
    expect(container.querySelector('path[data-role="comparison"]')).toHaveAttribute('stroke-dasharray')
  })

  it('shows recent operations derived from holdings', () => {
    renderInvestments(fixture)
    expect(screen.getByText('Compra')).toBeInTheDocument()
    expect(screen.getByText('12/07')).toBeInTheDocument()
  })

  it('renders portfolio alerts from the notifications section', () => {
    renderInvestments(fixture)
    expect(screen.getByText('YPFD +8%')).toBeInTheDocument()
  })
})
