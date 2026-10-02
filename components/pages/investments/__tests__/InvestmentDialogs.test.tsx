import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import esAR from '@/messages/es-AR.json'
import { RecordHoldingDialog } from '../RecordHoldingDialog'
import { SellHoldingDialog, type SellHoldingTarget } from '../SellHoldingDialog'
import { ApiError } from '@/lib/api/client'
import { TickerSearchBox } from '../TickerSearchBox'
import { MarketsTab } from '../MarketsTab'

const { createMutateAsync, sellMutateAsync, sellState, banksState, toastSuccess, toastError } = vi.hoisted(() => ({
  createMutateAsync: vi.fn(async () => ({})),
  sellMutateAsync: vi.fn(async () => ({
    holdingId: 10, soldQuantity: '100', remainingQuantity: '0', proceeds: '80000',
    bookedAmount: '79600', currency: 'ARS', closed: true,
  })),
  sellState: { isPending: false },
  banksState: { withAccounts: true, secondArsAccount: false },
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: toastSuccess, error: toastError },
}))

vi.mock('@/lib/hooks/useBanks', () => ({
  useBanks: () => ({
    banks: [
      {
        bankNumber: '072',
        name: 'Banco Santander',
        accounts: banksState.withAccounts
          ? [
              { cbu: '0720000000000000000011', name: 'Cuenta Corriente', currency: 'ARS', balance: '100000' },
              { cbu: '0720000000000000000022', name: 'Caja Ahorro USD', currency: 'USD', balance: '500' },
              ...(banksState.secondArsAccount
                ? [{ cbu: '0720000000000000000033', name: 'Caja Ahorro ARS', currency: 'ARS', balance: '2000' }]
                : []),
            ]
          : [],
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
  useSellHolding: () => ({
    mutateAsync: sellMutateAsync,
    isPending: sellState.isPending,
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
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="es-AR" messages={esAR}>
        {children}
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
  return render(ui, { wrapper })
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

  it('keeps typed quantity when the banks query returns a new array', async () => {
    const user = userEvent.setup()
    renderWithIntl(
      <RecordHoldingDialog
        open
        onOpenChange={() => {}}
        initialTicker="GGAL"
        initialName="Grupo Financiero Galicia"
        initialPrice={4850}
      />
    )

    const qtyInput = screen.getByPlaceholderText('100')
    await user.type(qtyInput, '50')

    expect(qtyInput).toHaveValue(50)
  })
})

describe('SellHoldingDialog', () => {
  const ggal = {
    id: 10,
    ticker: 'GGAL',
    name: 'Grupo Financiero Galicia',
    assetType: 'STOCK',
    quantity: 100,
    currency: 'ARS',
    currentPrice: 800,
    avgPurchasePrice: 650,
  }
  const al30 = {
    id: 11,
    ticker: 'AL30',
    name: 'Bonos Rep. Arg. 2030',
    assetType: 'BOND',
    quantity: 1000,
    currency: 'ARS',
    currentPrice: 80216,
    avgPurchasePrice: 700,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    sellState.isPending = false
    banksState.withAccounts = true
    banksState.secondArsAccount = false
  })

  function renderSell(holding: SellHoldingTarget, onOpenChange = vi.fn(), onSuccess = vi.fn()) {
    const view = renderWithIntl(
      <SellHoldingDialog holding={holding} open={true} onOpenChange={onOpenChange} onSuccess={onSuccess} />
    )
    const rerender = (next: SellHoldingTarget | null, open = true) =>
      view.rerender(
        <SellHoldingDialog holding={next} open={open} onOpenChange={onOpenChange} onSuccess={onSuccess} />
      )
    return { onOpenChange, onSuccess, rerender }
  }

  it('sells every unit at the market price by default', async () => {
    const user = userEvent.setup()
    const { onOpenChange, onSuccess } = renderSell(ggal)

    expect(screen.getByText(/Vender posición de GGAL/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Cantidad a vender')).toHaveValue(100)
    expect(screen.getByRole('switch', { name: 'Precio de mercado' })).toBeChecked()
    expect(screen.getByTestId('sell-estimate')).toHaveTextContent(/80\.000,00/)

    await user.click(screen.getByRole('button', { name: /Confirmar venta y liquidar/i }))

    await waitFor(() => {
      expect(sellMutateAsync).toHaveBeenCalledWith({
        id: 10,
        body: { quantity: '100', price: null, destinationCbu: '0720000000000000000011' },
      })
      expect(onOpenChange).toHaveBeenCalledWith(false)
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('shows the market price read-only while the switch is on', async () => {
    const user = userEvent.setup()
    renderSell(ggal)

    const locked = screen.getByTestId('sell-market-price-value')
    expect(locked).not.toHaveAttribute('aria-readonly')
    expect(locked).toHaveAccessibleDescription('Desactivá «Precio de mercado» para escribir otro precio.')
    expect(locked).toHaveTextContent(/800,00/)
    expect(locked).toHaveTextContent('Mercado')
    expect(screen.queryByLabelText(/Precio de venta/)).not.toBeInTheDocument()
    expect(screen.getAllByRole('spinbutton')).toHaveLength(1)

    await user.click(screen.getByRole('switch', { name: 'Precio de mercado' }))

    expect(screen.queryByTestId('sell-market-price-value')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Precio de venta/)).toBeEnabled()
  })

  it('sells part of a holding at the market price', async () => {
    const user = userEvent.setup()
    renderSell(ggal)

    const quantity = screen.getByLabelText('Cantidad a vender')
    await user.clear(quantity)
    await user.type(quantity, '40')

    expect(screen.getByTestId('sell-estimate')).toHaveTextContent(/32\.000,00/)
    await user.click(screen.getByRole('button', { name: 'Vender 40 y liquidar' }))

    await waitFor(() =>
      expect(sellMutateAsync).toHaveBeenCalledWith({
        id: 10,
        body: { quantity: '40', price: null, destinationCbu: '0720000000000000000011' },
      }),
    )
  })

  it('sells at a manual price when the market switch is off', async () => {
    const user = userEvent.setup()
    renderSell(ggal)

    expect(screen.queryByLabelText(/Precio de venta/)).not.toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: 'Precio de mercado' }))

    const price = screen.getByLabelText(/Precio de venta/)
    expect(price).toHaveValue(800)
    await user.clear(price)
    await user.type(price, '812.5')

    expect(screen.getByTestId('sell-estimate')).toHaveTextContent(/81\.250,00/)
    await user.click(screen.getByRole('button', { name: /Confirmar venta y liquidar/i }))

    await waitFor(() =>
      expect(sellMutateAsync).toHaveBeenCalledWith({
        id: 10,
        body: { quantity: '100', price: 812.5, destinationCbu: '0720000000000000000011' },
      }),
    )
  })

  it('rejects a quantity above the holding and a manual price of zero', async () => {
    const user = userEvent.setup()
    renderSell(ggal)

    const quantity = screen.getByLabelText('Cantidad a vender')
    await user.clear(quantity)
    await user.type(quantity, '150')
    expect(screen.getByRole('alert')).toHaveTextContent('No podés vender más de 100')
    expect(screen.getByRole('button', { name: 'Vender 150 y liquidar' })).toBeDisabled()

    await user.clear(quantity)
    await user.type(quantity, '10')
    await user.click(screen.getByRole('switch', { name: 'Precio de mercado' }))
    const price = screen.getByLabelText(/Precio de venta/)
    await user.clear(price)
    await user.type(price, '0')
    expect(screen.getByRole('alert')).toHaveTextContent('El precio debe ser mayor a cero')
    expect(screen.getByRole('button', { name: 'Vender 10 y liquidar' })).toBeDisabled()

    expect(sellMutateAsync).not.toHaveBeenCalled()
  })

  it('quotes bonds per 100 VN, starts the manual price empty and shows no estimate', async () => {
    const user = userEvent.setup()
    renderSell(al30)

    expect(screen.getByTestId('sell-bond-note')).toHaveTextContent('cada 100 VN')
    expect(screen.queryByTestId('sell-estimate')).not.toBeInTheDocument()

    await user.click(screen.getByRole('switch', { name: 'Precio de mercado' }))
    const price = screen.getByLabelText('Precio de venta (cada 100 VN)')
    expect(price).toHaveValue(null)
    await user.type(price, '80500')
    await user.click(screen.getByRole('button', { name: /Confirmar venta y liquidar/i }))

    await waitFor(() =>
      expect(sellMutateAsync).toHaveBeenCalledWith({
        id: 11,
        body: { quantity: '1000', price: 80500, destinationCbu: '0720000000000000000011' },
      }),
    )
  })

  it('reports the booked amount from the response after a full sale', async () => {
    const user = userEvent.setup()
    renderSell(ggal)

    await user.click(screen.getByRole('button', { name: /Confirmar venta y liquidar/i }))

    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith('Vendiste toda tu posición de GGAL', {
        description: expect.stringMatching(/^Se acreditaron \$\s?79\.600,00\.$/),
      }),
    )
  })

  it('says nothing was credited when the fees take the whole sale', async () => {
    const user = userEvent.setup()
    sellMutateAsync.mockResolvedValueOnce({
      holdingId: 10, soldQuantity: '10.0000', remainingQuantity: '90.0000', proceeds: '8000',
      bookedAmount: '0', currency: 'ARS', closed: false,
    })
    renderSell(ggal)

    const quantity = screen.getByLabelText('Cantidad a vender')
    await user.clear(quantity)
    await user.type(quantity, '10')
    await user.click(screen.getByRole('button', { name: 'Vender 10 y liquidar' }))

    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith('Vendiste 10 de GGAL', {
        description: 'No se acreditó dinero: las comisiones cubren todo el monto de la venta.',
      }),
    )
  })

  it('says nothing was credited when there is no account in the holding currency', async () => {
    const user = userEvent.setup()
    banksState.withAccounts = false
    sellMutateAsync.mockResolvedValueOnce({
      holdingId: 10, soldQuantity: '100', remainingQuantity: '0', proceeds: '80000',
      bookedAmount: '0', currency: 'ARS', closed: true,
    })
    renderSell(ggal)

    await user.click(screen.getByRole('button', { name: /Confirmar venta y liquidar/i }))

    await waitFor(() => {
      expect(sellMutateAsync).toHaveBeenCalledWith({
        id: 10,
        body: { quantity: '100', price: null, destinationCbu: null },
      })
      expect(toastSuccess).toHaveBeenCalledWith('Vendiste toda tu posición de GGAL', {
        description: 'No se acreditó dinero en ninguna cuenta.',
      })
    })
  })

  it('explains a sale above the current holding and keeps the dialog open', async () => {
    const user = userEvent.setup()
    sellMutateAsync.mockRejectedValueOnce(new ApiError('too many', 422, 'holding_sale_exceeds_quantity'))
    const { onOpenChange } = renderSell(ggal)

    await user.click(screen.getByRole('button', { name: /Confirmar venta y liquidar/i }))

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('No pudimos vender GGAL', {
        description: 'Ya no tenés esa cantidad de GGAL. Actualizá la página y probá de nuevo.',
      }),
    )
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
    expect(toastSuccess).not.toHaveBeenCalled()
  })

  it('falls back to a generic message for an unknown error', async () => {
    const user = userEvent.setup()
    sellMutateAsync.mockRejectedValueOnce(new Error('boom'))
    renderSell(ggal)

    await user.click(screen.getByRole('button', { name: /Confirmar venta y liquidar/i }))

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('No pudimos vender GGAL', {
        description: 'Probá de nuevo en un momento.',
      }),
    )
  })

  it('keeps the typed quantity, price mode and manual price when the holding refetches', async () => {
    const user = userEvent.setup()
    const { rerender } = renderSell(ggal)

    const quantity = screen.getByLabelText('Cantidad a vender')
    await user.clear(quantity)
    await user.type(quantity, '40')
    await user.click(screen.getByRole('switch', { name: 'Precio de mercado' }))
    const price = screen.getByLabelText(/Precio de venta/)
    await user.clear(price)
    await user.type(price, '812.5')

    rerender({ ...ggal, currentPrice: 805, quantity: 120 })

    expect(screen.getByLabelText('Cantidad a vender')).toHaveValue(40)
    expect(screen.getByRole('switch', { name: 'Precio de mercado' })).not.toBeChecked()
    expect(screen.getByLabelText(/Precio de venta/)).toHaveValue(812.5)

    await user.click(screen.getByRole('button', { name: 'Vender 40 y liquidar' }))

    await waitFor(() =>
      expect(sellMutateAsync).toHaveBeenCalledWith({
        id: 10,
        body: { quantity: '40', price: 812.5, destinationCbu: '0720000000000000000011' },
      }),
    )
  })

  it('keeps the chosen destination account when the banks query refetches', async () => {
    const user = userEvent.setup()
    banksState.secondArsAccount = true
    const { rerender } = renderSell(ggal)

    screen.getByRole('combobox').focus()
    await user.keyboard('{Enter}')
    await user.click(await screen.findByRole('option', { name: /Caja Ahorro ARS/ }))
    rerender({ ...ggal, currentPrice: 805 })

    await user.click(screen.getByRole('button', { name: /Confirmar venta y liquidar/i }))

    await waitFor(() =>
      expect(sellMutateAsync).toHaveBeenCalledWith({
        id: 10,
        body: { quantity: '100', price: null, destinationCbu: '0720000000000000000033' },
      }),
    )
  })

  it('resets the form when reopened or opened for another holding', async () => {
    const user = userEvent.setup()
    const { rerender } = renderSell(ggal)

    await user.clear(screen.getByLabelText('Cantidad a vender'))
    await user.type(screen.getByLabelText('Cantidad a vender'), '40')
    await user.click(screen.getByRole('switch', { name: 'Precio de mercado' }))

    rerender(ggal, false)
    rerender(ggal, true)

    expect(screen.getByLabelText('Cantidad a vender')).toHaveValue(100)
    expect(screen.getByRole('switch', { name: 'Precio de mercado' })).toBeChecked()

    await user.clear(screen.getByLabelText('Cantidad a vender'))
    await user.type(screen.getByLabelText('Cantidad a vender'), '40')
    rerender(al30)

    expect(screen.getByLabelText('Cantidad a vender')).toHaveValue(1000)
  })

  it('sends the exact held quantity when selling everything', async () => {
    const user = userEvent.setup()
    const precise = { ...ggal, quantity: Number('123456789012.123456'), exactQuantity: '123456789012.123456' }
    renderSell(precise)

    await user.clear(screen.getByLabelText('Cantidad a vender'))
    await user.type(screen.getByLabelText('Cantidad a vender'), '40')
    await user.click(screen.getByRole('button', { name: 'Todo' }))
    await user.click(screen.getByRole('button', { name: /Confirmar venta y liquidar/i }))

    await waitFor(() =>
      expect(sellMutateAsync).toHaveBeenCalledWith({
        id: 10,
        body: { quantity: '123456789012.123456', price: null, destinationCbu: '0720000000000000000011' },
      }),
    )
  })

  it('disables the confirm button while the sale is pending', () => {
    sellState.isPending = true
    renderSell(ggal)

    expect(screen.getByRole('button', { name: 'Vendiendo...' })).toBeDisabled()
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

  it('labels the chart ranges and formats the variations as shared percents', () => {
    renderWithIntl(<MarketsTab initialTicker="GGAL" />)

    for (const label of ['30D', '90D', '1A', 'TODO']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
    expect(screen.queryByRole('button', { name: 'D30' })).not.toBeInTheDocument()
    expect(screen.getByText('+3,45 %')).toBeInTheDocument()
    expect(screen.getByText('+1,80 %')).toBeInTheDocument()
  })
})
