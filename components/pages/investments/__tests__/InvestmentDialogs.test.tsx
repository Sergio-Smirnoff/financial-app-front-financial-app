import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import esAR from '@/messages/es-AR.json'
import { RecordHoldingDialog } from '../RecordHoldingDialog'
import { SellHoldingDialog } from '../SellHoldingDialog'
import { TickerSearchBox } from '../TickerSearchBox'
import { MarketsTab } from '../MarketsTab'

const { createMutateAsync, deleteMutateAsync } = vi.hoisted(() => ({
  createMutateAsync: vi.fn(async () => ({})),
  deleteMutateAsync: vi.fn(async () => undefined),
}))

vi.mock('@/lib/hooks/useBanks', () => ({
  useBanks: () => ({
    banks: [
      {
        bankNumber: '072',
        name: 'Banco Santander',
        accounts: [
          { cbu: '0720000000000000000011', name: 'Cuenta Corriente', currency: 'ARS', balance: '100000' },
          { cbu: '0720000000000000000022', name: 'Caja Ahorro USD', currency: 'USD', balance: '500' },
        ],
      },
    ],
    isLoading: false,
  }),
}))

vi.mock('@/lib/hooks/useInvestments', () => ({
  useCreateHolding: () => ({
    mutateAsync: createMutateAsync,
    isPending: false,
  }),
  useDeleteHolding: () => ({
    mutateAsync: deleteMutateAsync,
    isPending: false,
  }),
  useTickerSearch: (q: string) => ({
    data: q.length > 0 ? [
      { ticker: 'GGAL', name: 'Grupo Financiero Galicia', price: 4850, currency: 'ARS', variation: 3.45 },
    ] : [],
    isLoading: false,
  }),
  useTickerResearch: (ticker: string | null) => ({
    data: ticker ? {
      ticker,
      currency: 'ARS',
      currentPrice: 4850,
      variation: 3.45,
      series: [
        { date: '2026-08-01', price: 4500 },
        { date: '2026-09-01', price: 4850 },
      ],
    } : null,
    isLoading: false,
    isError: false,
  }),
  useMarketDiscovery: () => ({
    data: {
      marketDataAvailable: true,
      opportunities: [
        { ticker: 'SPY', name: 'S&P 500 ETF', price: 32400, currency: 'ARS', variation: 1.8 },
      ],
    },
    isLoading: false,
  }),
  useHoldings: () => ({ data: [], isLoading: false }),
}))

function renderWithIntl(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="es-AR" messages={esAR}>
        {ui}
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
}

describe('RecordHoldingDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form elements and submits valid holding data', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    renderWithIntl(
      <RecordHoldingDialog
        open={true}
        onOpenChange={onOpenChange}
        initialTicker="GGAL"
        initialName="Grupo Financiero Galicia"
        initialPrice={4850}
      />
    )

    expect(screen.getByRole('heading', { name: 'Registrar inversión' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('GGAL')).toBeInTheDocument()

    // Quantity field
    const qtyInput = screen.getByPlaceholderText('100')
    await user.type(qtyInput, '50')

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /^Registrar inversión$/i })
    await user.click(submitBtn)

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          bankNumber: '072',
          ticker: 'GGAL',
          name: 'Grupo Financiero Galicia',
          quantity: 50,
          avgPurchasePrice: 4850,
          currency: 'ARS',
        })
      )
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})

describe('SellHoldingDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders holding summary, liquidation value and confirms sell', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const onSuccess = vi.fn()

    const target = {
      id: 10,
      ticker: 'AL30',
      name: 'Bonos Rep. Arg.',
      quantity: 100,
      currency: 'ARS',
      currentPrice: 800,
      avgPurchasePrice: 650,
    }

    renderWithIntl(
      <SellHoldingDialog
        holding={target}
        open={true}
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
      />
    )

    expect(screen.getByText(/Vender posición de AL30/i)).toBeInTheDocument()
    expect(screen.getByText(/100 unidades/i)).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: /Confirmar venta y liquidar/i })
    await user.click(confirmBtn)

    await waitFor(() => {
      expect(deleteMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 10,
          destinationCbu: '0720000000000000000011',
        })
      )
      expect(onOpenChange).toHaveBeenCalledWith(false)
      expect(onSuccess).toHaveBeenCalled()
    })
  })
})

describe('TickerSearchBox & MarketsTab', () => {
  it('searches tickers and renders dropdown results', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()

    renderWithIntl(<TickerSearchBox onSelect={onSelect} />)

    const input = screen.getByPlaceholderText(/Buscá un ticker/i)
    await user.type(input, 'GGAL')

    await waitFor(() => {
      expect(screen.getByText('GGAL')).toBeInTheDocument()
    })

    await user.click(screen.getByText('GGAL'))
    expect(onSelect).toHaveBeenCalledWith('GGAL', expect.anything())
  })

  it('renders MarketsTab with search, chart panel and discovery cards', () => {
    renderWithIntl(<MarketsTab initialTicker="GGAL" />)

    expect(screen.getByRole('heading', { name: 'GGAL' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Registrar compra de GGAL/i })).toBeInTheDocument()
    expect(screen.getByText('SPY')).toBeInTheDocument()
  })
})
