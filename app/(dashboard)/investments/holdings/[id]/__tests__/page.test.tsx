import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import esAR from '@/messages/es-AR.json'
import { stubChartSize } from '@/test/chartSize'
import type { Holding } from '@/types/investments'
import type { InvestmentsBff, PositionRow } from '@/lib/api/bff/types'
import HoldingDetailPage from '../page'

const { holdings, refetch, params, bff, research } = vi.hoisted(() => ({
  bff: { data: undefined as InvestmentsBff | undefined, isPending: false },
  research: { data: null as { currentPrice: number; series: { date: string; price: number }[] } | null },
  holdings: { data: undefined as Holding[] | undefined, isPending: false, isError: false, isFetching: false },
  refetch: vi.fn(),
  params: { id: '42' },
}))

vi.mock('next/navigation', () => ({
  useParams: () => params,
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/hooks/useBanks', () => ({
  useBanks: () => ({ banks: [], isLoading: false }),
}))

vi.mock('@/lib/hooks/useInvestments', () => ({
  useHoldings: () => ({ ...holdings, refetch }),
  useSellHolding: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useTickerResearch: () => ({ data: research.data, isLoading: false }),
}))

vi.mock('@/lib/hooks/useInvestmentsPage', () => ({
  useInvestmentsPage: () => bff,
}))

vi.mock('@/lib/hooks/useBffQuery', () => ({
  useBffQuery: () => ({ currency: 'ARS', secondary: 'none' }),
}))

const ggal: Holding = {
  id: 42,
  userId: 1,
  bankNumber: '017',
  ticker: 'GGAL',
  name: 'Grupo Financiero Galicia',
  assetType: 'STOCK',
  quantity: 10,
  exactQuantity: '10',
  avgPurchasePrice: 4000,
  exactAvgPurchasePrice: '4000',
  currency: 'ARS',
  notifyGainThresholdPct: null,
  notifyLossThresholdPct: null,
  exactNotifyGainThresholdPct: null,
  exactNotifyLossThresholdPct: null,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
}

const al30: Holding = {
  ...ggal,
  ticker: 'AL30',
  name: 'Bonos Rep. Arg. 2030',
  assetType: 'BOND',
  quantity: 1000,
  exactQuantity: '1000',
  avgPurchasePrice: 700,
  exactAvgPurchasePrice: '700',
}

const ars = (amount: string) => ({ amount, currency: 'ARS', secondary: null })
const observedAt = '2026-10-01T10:00:00Z'

const al30Row: PositionRow = {
  holdingId: 42,
  ticker: 'AL30',
  name: 'Bonos Rep. Arg. 2030',
  assetType: 'BOND',
  bankNumber: '017',
  quantity: 1000,
  avgCost: ars('700'),
  price: ars('80216'),
  marketValue: ars('802160'),
  pnl: ars('102160'),
  pnlPct: 14.59,
}

const withPositions = (status: 'OK' | 'UNAVAILABLE', rows: PositionRow[] | null) =>
  ({ positions: { status, observedAt, data: rows } }) as InvestmentsBff

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="es-AR" messages={esAR}>
        <HoldingDetailPage />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  )
}

describe('HoldingDetailPage', () => {
  beforeEach(() => {
    stubChartSize(640, 240)
    vi.clearAllMocks()
    params.id = '42'
    holdings.data = []
    holdings.isPending = false
    holdings.isError = false
    holdings.isFetching = false
    bff.data = withPositions('OK', [])
    bff.isPending = false
    research.data = null
  })
  afterEach(() => vi.unstubAllGlobals())

  it('says the holding was not found instead of inventing one', () => {
    renderPage()
    expect(screen.getByTestId('holding-not-found')).toHaveTextContent('No encontramos esa tenencia.')
    expect(screen.getByRole('link', { name: /Volver a Inversiones/ })).toHaveAttribute('href', '/investments?tab=cartera')
    expect(screen.queryByText('YPFD')).not.toBeInTheDocument()
  })

  it('renders the holding when it is in the list', () => {
    holdings.data = [ggal]
    renderPage()
    expect(screen.getByRole('heading', { name: 'GGAL' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(screen.queryByTestId('holding-not-found')).not.toBeInTheDocument()
  })

  it('treats an id with trailing junk as not found', () => {
    params.id = '42abc'
    holdings.data = [ggal]
    renderPage()
    expect(screen.getByTestId('holding-not-found')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'GGAL' })).not.toBeInTheDocument()
  })

  it.each(['0', '-42', '4.2', ''])('treats the id %j as not found', (id) => {
    params.id = id
    holdings.data = [ggal]
    renderPage()
    expect(screen.getByTestId('holding-not-found')).toBeInTheDocument()
  })

  it('keeps loading instead of saying not found while a paused first load is pending', () => {
    holdings.data = undefined
    holdings.isPending = true
    renderPage()
    expect(screen.queryByTestId('holding-not-found')).not.toBeInTheDocument()
    expect(screen.getByTestId('holding-loading')).toBeInTheDocument()
  })

  it('says the holdings failed to load, not that the holding is missing, and retries', async () => {
    const user = userEvent.setup()
    holdings.isError = true
    renderPage()

    expect(screen.getByTestId('holding-load-error')).toHaveTextContent(esAR.investments.holdings.loadFailed)
    expect(screen.queryByTestId('holding-not-found')).not.toBeInTheDocument()
    expect(screen.queryByText('YPFD')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(refetch).toHaveBeenCalled()
  })

  it('keeps showing a cached holding when a refetch fails', () => {
    holdings.data = [ggal]
    holdings.isError = true
    renderPage()
    expect(screen.getByRole('heading', { name: 'GGAL' })).toBeInTheDocument()
    expect(screen.queryByTestId('holding-load-error')).not.toBeInTheDocument()
  })

  describe('figures', () => {
    beforeEach(() => {
      holdings.data = [al30]
      research.data = { currentPrice: 80216, series: [] }
    })

    it('shows the backend value and P&L for a bond instead of quantity times the per-100 price', () => {
      bff.data = withPositions('OK', [al30Row])
      renderPage()
      const kpis = screen.getAllByTestId('position-kpi').map((tile) => tile.textContent)
      expect(kpis[2]).toMatch(/802\.160,00/)
      expect(document.body.textContent).not.toMatch(/80\.216\.000/)
      expect(screen.getByTestId('position-actions')).toHaveTextContent('+14,59 %')
      expect(screen.getByTestId('position-actions')).toHaveTextContent(/102\.160,00/)
      expect(screen.queryByTestId('position-figures-unavailable')).not.toBeInTheDocument()
    })

    it('says the figures are unavailable when the holding has no backend row', () => {
      bff.data = withPositions('OK', [{ ...al30Row, holdingId: 7 }])
      renderPage()
      expect(screen.getByTestId('position-figures-unavailable')).toHaveTextContent(esAR.investments.holdings.figuresUnavailable)
      expect(screen.getAllByTestId('position-kpi').map((tile) => tile.textContent)).toEqual(['—', '—', '—'])
      expect(document.body.textContent).not.toMatch(/80\.216\.000/)
    })

    it('says the figures are unavailable when the positions section is down', () => {
      bff.data = withPositions('UNAVAILABLE', null)
      renderPage()
      expect(screen.getByTestId('position-figures-unavailable')).toBeInTheDocument()
    })

    it('waits for the backend figures without calling them unavailable', () => {
      bff.data = undefined
      bff.isPending = true
      renderPage()
      expect(screen.getByRole('heading', { name: 'AL30' })).toBeInTheDocument()
      expect(screen.queryByTestId('position-figures-unavailable')).not.toBeInTheDocument()
    })
  })
})
