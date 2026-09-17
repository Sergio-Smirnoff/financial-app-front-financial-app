import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PositionDetail } from '../PositionDetail'
import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import esAR from '@/messages/es-AR.json'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/hooks/useBanks', () => ({
  useBanks: () => ({ banks: [], isLoading: false }),
}))

vi.mock('@/lib/hooks/useInvestments', () => ({
  useCreateHolding: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteHolding: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useHoldings: () => ({ data: [], isLoading: false }),
  useTickerResearch: () => ({ data: null, isLoading: false }),
}))

function renderWithIntl(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="es-AR" messages={esAR}>{ui}</NextIntlClientProvider>
    </QueryClientProvider>
  )
}

const holdingFixture = {
  id: 42,
  ticker: 'YPFD',
  name: 'YPF S.A.',
  assetType: 'Acción',
  quantity: 100,
  avgPrice: { amount: '12000', currency: 'ARS', secondary: null },
  currentPrice: { amount: '15000', currency: 'ARS', secondary: null },
  totalValue: { amount: '1500000', currency: 'ARS', secondary: null },
  pnl: { amount: { amount: '300000', currency: 'ARS', secondary: null }, pct: 25 },
  prices: [
    { date: '2026-08-01', value: 12000 },
    { date: '2026-08-02', value: 13500 },
    { date: '2026-08-03', value: 15000 },
  ],
}

describe('PositionDetail', () => {
  it('renders the price chart with axes', () => {
    renderWithIntl(<PositionDetail holding={holdingFixture} />)
    expect(screen.getAllByTestId('tick-y').length).toBeGreaterThan(2)
  })

  it('plots exactly the delivered price points', () => {
    const { container } = renderWithIntl(<PositionDetail holding={holdingFixture} />)
    const path = container.querySelector('path[data-role="line"]')!.getAttribute('d')!
    expect(path.match(/[MC]/g)?.length).toBeGreaterThanOrEqual(1)
  })

  it('renders action buttons for sell and buy more', () => {
    renderWithIntl(<PositionDetail holding={holdingFixture} />)
    expect(screen.getByRole('button', { name: /Vender/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Comprar más/i })).toBeInTheDocument()
  })
})
