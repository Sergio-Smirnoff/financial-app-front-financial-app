import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import esAR from '@/messages/es-AR.json'
import { stubChartSize } from '@/test/chartSize'
import type { Holding } from '@/types/investments'
import HoldingDetailPage from '../page'

const { holdings, refetch, params } = vi.hoisted(() => ({
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
  useTickerResearch: () => ({ data: null, isLoading: false }),
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
})
