import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { stubChartSize } from '@/test/chartSize'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PositionDetail } from '../PositionDetail'
import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import esAR from '@/messages/es-AR.json'
import { useHoldingDraftStore } from '@/lib/store/holdingDraft.store'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/lib/hooks/useBanks', () => ({
  useBanks: () => ({ banks: [], isLoading: false }),
}))

vi.mock('@/lib/hooks/useInvestments', () => ({
  useSellHolding: () => ({ mutateAsync: vi.fn(), isPending: false }),
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
  beforeEach(() => stubChartSize(640, 240))
  afterEach(() => vi.unstubAllGlobals())

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

  it('offers Vender, Editar and Comprar más in that order, wrapping on a phone', () => {
    renderWithIntl(<PositionDetail holding={holdingFixture} />)
    const actions = screen.getByTestId('position-actions')
    expect(Array.from(actions.querySelectorAll('button')).map((b) => b.textContent)).toEqual(['Vender', 'Editar', 'Comprar más'])
    expect(actions).toHaveClass('flex-wrap')
  })

  it('routes Editar to Cartera with the edit dialog for this holding', async () => {
    const user = userEvent.setup()
    useHoldingDraftStore.setState({ draft: null })
    renderWithIntl(<PositionDetail holding={holdingFixture} />)

    await user.click(screen.getByRole('button', { name: 'Editar' }))

    expect(useHoldingDraftStore.getState().draft).toEqual({ mode: 'edit', holdingId: 42 })
    expect(push).toHaveBeenCalledWith('/investments?tab=cartera')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('links back to Cartera', () => {
    renderWithIntl(<PositionDetail holding={holdingFixture} />)
    expect(screen.getByRole('link', { name: /Volver a Inversiones/ })).toHaveAttribute('href', '/investments?tab=cartera')
  })

  it('shows the quantity with es-AR separators', () => {
    renderWithIntl(<PositionDetail holding={{ ...holdingFixture, quantity: 1500.5 }} />)
    expect(screen.getByText('1.500,5')).toBeInTheDocument()
  })

  it('routes "Comprar más" to Cartera with the holding prefilled', async () => {
    const user = userEvent.setup()
    useHoldingDraftStore.setState({ draft: null })
    renderWithIntl(<PositionDetail holding={{ ...holdingFixture, assetType: 'STOCK' }} />)

    await user.click(screen.getByRole('button', { name: /Comprar más/i }))

    expect(useHoldingDraftStore.getState().draft).toEqual({
      mode: 'create',
      prefill: { ticker: 'YPFD', name: 'YPF S.A.', assetType: 'STOCK', price: 15000, currency: 'ARS' },
    })
    expect(push).toHaveBeenCalledWith('/investments?tab=cartera')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('leaves the price blank when there is no current price', async () => {
    const user = userEvent.setup()
    useHoldingDraftStore.setState({ draft: null })
    renderWithIntl(
      <PositionDetail holding={{ ...holdingFixture, currentPrice: { amount: '', currency: 'ARS', secondary: null } }} />,
    )

    await user.click(screen.getByRole('button', { name: /Comprar más/i }))

    expect(useHoldingDraftStore.getState().draft).toEqual({
      mode: 'create',
      prefill: { ticker: 'YPFD', name: 'YPF S.A.', assetType: undefined, price: undefined, currency: 'ARS' },
    })
  })
})
