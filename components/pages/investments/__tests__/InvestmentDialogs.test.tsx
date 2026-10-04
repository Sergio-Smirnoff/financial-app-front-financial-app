import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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
import type { HoldingDraft } from '@/lib/store/holdingDraft.store'
import type { Holding } from '@/types/investments'

if (!Element.prototype.hasPointerCapture) Element.prototype.hasPointerCapture = () => false
if (!Element.prototype.setPointerCapture) Element.prototype.setPointerCapture = () => {}
if (!Element.prototype.releasePointerCapture) Element.prototype.releasePointerCapture = () => {}

const { createMutateAsync, updateMutateAsync, sellMutateAsync, holdings, sellState, banksState, toastSuccess, toastError } = vi.hoisted(() => ({
  createMutateAsync: vi.fn(async () => ({})),
  updateMutateAsync: vi.fn(async () => ({})),
  sellMutateAsync: vi.fn(async () => ({
    holdingId: 10, soldQuantity: '100', remainingQuantity: '0', proceeds: '80000',
    bookedAmount: '79600', currency: 'ARS', closed: true,
  })),
  holdings: { data: [] as Holding[], isPending: false, isError: false },
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
  useUpdateHolding: () => ({ mutateAsync: updateMutateAsync, isPending: false }),
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
  useHoldings: () => ({ data: holdings.data, isPending: holdings.isPending, isError: holdings.isError }),
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

const ggalHolding = {
  id: 7,
  userId: 1,
  bankNumber: '072',
  ticker: 'GGAL',
  name: 'Grupo Financiero Galicia',
  assetType: 'STOCK' as const,
  quantity: 100,
  avgPurchasePrice: 4850,
  currency: 'ARS',
  notifyGainThresholdPct: 20,
  notifyLossThresholdPct: null,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
}

function renderDialog(draft: HoldingDraft | null, onClose = vi.fn()) {
  renderWithIntl(<RecordHoldingDialog draft={draft} onClose={onClose} />)
  return { onClose }
}

describe('RecordHoldingDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    holdings.data = [ggalHolding]
    holdings.isPending = false
    holdings.isError = false
  })

  it('renders form elements and submits valid holding data', async () => {
    const user = userEvent.setup()
    const { onClose } = renderDialog({
      mode: 'create',
      prefill: { ticker: 'GGAL', name: 'Grupo Financiero Galicia', price: 4850 },
    })

    expect(screen.getByRole('heading', { name: 'Registrar inversión' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('GGAL')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('100'), '50')
    await user.click(screen.getByRole('button', { name: /^Registrar inversión$/i }))

    await waitFor(() => {
      expect(createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          bankNumber: '072',
          ticker: 'GGAL',
          name: 'Grupo Financiero Galicia',
          quantity: '50',
          avgPurchasePrice: '4850',
          currency: 'ARS',
        }),
      )
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('keeps typed quantity when the banks query returns a new array', async () => {
    const user = userEvent.setup()
    renderDialog({ mode: 'create', prefill: { ticker: 'GGAL', price: 4850 } })

    const qtyInput = screen.getByPlaceholderText('100')
    await user.type(qtyInput, '50')

    expect(qtyInput).toHaveValue('50')
  })

  it('stacks the form into one column on a phone', () => {
    renderDialog({ mode: 'create', prefill: {} })
    for (const label of ['Ticker', 'Cantidad', 'Avisarme si sube más de (%)']) {
      expect(screen.getByLabelText(label).closest('.grid')).toHaveClass('max-md:grid-cols-1')
    }
  })

  it('renders nothing without a draft', () => {
    renderDialog(null)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('explains bond nominal value when the type is a bond', () => {
    renderDialog({ mode: 'create', prefill: { ticker: 'GD30', assetType: 'BOND' } })
    expect(screen.getByTestId('bond-note')).toHaveTextContent('valor nominal (VN)')
  })

  it('edits the native holding without moving money', async () => {
    const user = userEvent.setup()
    const { onClose } = renderDialog({ mode: 'edit', holdingId: 7 })

    expect(screen.getByRole('heading', { name: 'Editar inversión' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('4850')).toBeInTheDocument()
    expect(screen.getByDisplayValue('100')).toBeInTheDocument()
    expect(screen.getByDisplayValue('20')).toBeInTheDocument()
    expect(screen.queryByLabelText('Cuenta de débito (CBU)')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Banco / Broker')).toBeDisabled()

    await user.click(screen.getByLabelText('Tipo de activo'))
    await user.click(await screen.findByRole('option', { name: 'Bono' }))
    expect(screen.getByTestId('bond-note')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(updateMutateAsync).toHaveBeenCalledWith({
        id: 7,
        body: {
          bankNumber: '072',
          fundingCbu: null,
          ticker: 'GGAL',
          name: 'Grupo Financiero Galicia',
          assetType: 'BOND',
          currency: 'ARS',
          quantity: '100',
          avgPurchasePrice: '4850',
          notifyGainThresholdPct: '20',
          notifyLossThresholdPct: null,
        },
      }),
    )
    expect(createMutateAsync).not.toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('sends a quantity beyond double precision exactly as typed', async () => {
    const user = userEvent.setup()
    renderDialog({ mode: 'create', prefill: { ticker: 'GGAL', name: 'Grupo Financiero Galicia', price: 4850 } })

    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '123456789012.12345' } })
    await user.click(screen.getByRole('button', { name: /^Registrar inversión$/i }))

    await waitFor(() =>
      expect(createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: '123456789012.12345', avgPurchasePrice: '4850' }),
      ),
    )
  })

  it('sends a comma decimal normalised', async () => {
    const user = userEvent.setup()
    renderDialog({ mode: 'create', prefill: { ticker: 'GGAL', name: 'Grupo Financiero Galicia' } })

    fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '1,5' } })
    fireEvent.change(screen.getByLabelText('Precio de compra unitario'), { target: { value: '4850,50' } })
    await user.click(screen.getByRole('button', { name: /^Registrar inversión$/i }))

    await waitFor(() =>
      expect(createMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: '1.5', avgPurchasePrice: '4850.5' }),
      ),
    )
  })

  it('shows a format error for an exponent and sends nothing', async () => {
    const user = userEvent.setup()
    renderDialog({ mode: 'create', prefill: { ticker: 'GGAL', name: 'Grupo Financiero Galicia', price: 4850 } })

    const quantity = screen.getByLabelText('Cantidad')
    fireEvent.change(quantity, { target: { value: '1e-7' } })
    expect(screen.getByRole('alert')).toHaveTextContent('Ingresá un número válido (ej: 1,5).')
    expect(quantity).toHaveAttribute('aria-invalid', 'true')
    expect(quantity).toHaveAccessibleDescription('Ingresá un número válido (ej: 1,5).')

    await user.click(screen.getByRole('button', { name: /^Registrar inversión$/i }))
    expect(createMutateAsync).not.toHaveBeenCalled()
  })

  it('saves an unchanged edit with the exact stored quantity', async () => {
    const user = userEvent.setup()
    holdings.data = [{ ...ggalHolding, quantity: 0.123456, exactQuantity: '0.123456' }]
    renderDialog({ mode: 'edit', holdingId: 7 })

    expect(screen.getByLabelText('Cantidad')).toHaveValue('0.123456')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(updateMutateAsync).toHaveBeenCalledWith({
        id: 7,
        body: expect.objectContaining({ quantity: '0.123456', avgPurchasePrice: '4850' }),
      }),
    )
  })

  it('saves an unchanged edit with the exact stored price and thresholds', async () => {
    const user = userEvent.setup()
    holdings.data = [{
      ...ggalHolding,
      avgPurchasePrice: Number('123456789012.123456'),
      exactAvgPurchasePrice: '123456789012.123456',
      exactNotifyGainThresholdPct: '20.5',
      exactNotifyLossThresholdPct: null,
    }]
    renderDialog({ mode: 'edit', holdingId: 7 })

    expect(screen.getByLabelText('Precio de compra unitario')).toHaveValue('123456789012.123456')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(updateMutateAsync).toHaveBeenCalledWith({
        id: 7,
        body: expect.objectContaining({
          avgPurchasePrice: '123456789012.123456',
          notifyGainThresholdPct: '20.5',
          notifyLossThresholdPct: null,
        }),
      }),
    )
  })

  it.each([
    ['1.234', 'Admite hasta 2 decimales'],
    ['-1', 'Ingresá un número válido (ej: 1,5).'],
    ['1000', 'Admite hasta 3 dígitos enteros'],
  ])('rejects the threshold %s before sending', async (value, message) => {
    const user = userEvent.setup()
    renderDialog({ mode: 'edit', holdingId: 7 })

    const gain = screen.getByLabelText('Avisarme si sube más de (%)')
    fireEvent.change(gain, { target: { value } })
    expect(screen.getByRole('alert')).toHaveTextContent(message)
    expect(gain).toHaveAttribute('aria-invalid', 'true')
    expect(gain).toHaveAccessibleDescription(message)

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(updateMutateAsync).not.toHaveBeenCalled()
  })

  it('sends an empty threshold as null and a filled one as a string', async () => {
    const user = userEvent.setup()
    renderDialog({ mode: 'edit', holdingId: 7 })

    fireEvent.change(screen.getByLabelText('Avisarme si sube más de (%)'), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText('Stop-loss si cae más de (%)'), { target: { value: '12,50' } })
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(updateMutateAsync).toHaveBeenCalledWith({
        id: 7,
        body: expect.objectContaining({ notifyGainThresholdPct: null, notifyLossThresholdPct: '12.5' }),
      }),
    )
  })

  it('warns that a renamed ticker shows at average cost', async () => {
    const user = userEvent.setup()
    renderDialog({ mode: 'edit', holdingId: 7 })

    const ticker = screen.getByLabelText('Ticker')
    await user.clear(ticker)
    await user.type(ticker, 'AL30')
    expect(screen.getByTestId('ticker-change-note')).toHaveTextContent('AL30 se muestra a su costo promedio')
  })

  it('says so when the holding to edit is not in the list', () => {
    renderDialog({ mode: 'edit', holdingId: 999 })
    expect(screen.getByText('No encontramos esa tenencia.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).not.toBeInTheDocument()
  })

  it('says the holding is loading, not missing, while a paused first load is pending', () => {
    holdings.data = []
    holdings.isPending = true
    renderDialog({ mode: 'edit', holdingId: 7 })
    expect(screen.getByText(esAR.investments.holdings.loadingHolding)).toBeInTheDocument()
    expect(screen.queryByText('No encontramos esa tenencia.')).not.toBeInTheDocument()
  })

  it('explains a known create error from the catalogue instead of the raw message', async () => {
    const user = userEvent.setup()
    createMutateAsync.mockRejectedValueOnce(new ApiError('Duplicate holding GGAL for bank 072', 409, 'resource_already_exists'))
    renderDialog({ mode: 'create', prefill: { ticker: 'GGAL', name: 'Grupo Financiero Galicia', price: 4850 } })

    await user.type(screen.getByPlaceholderText('100'), '50')
    await user.click(screen.getByRole('button', { name: /^Registrar inversión$/i }))

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(esAR.investments.holdings.toastCreateFailed, {
        description: esAR.investments.holdings.errors.alreadyExists,
      }),
    )
  })

  it('falls back to a translated generic message for an unknown update error', async () => {
    const user = userEvent.setup()
    updateMutateAsync.mockRejectedValueOnce(new Error('socket hang up'))
    renderDialog({ mode: 'edit', holdingId: 7 })

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith(esAR.investments.holdings.toastUpdateFailed, {
        description: esAR.investments.holdings.errors.unknown,
      }),
    )
  })

  it('says the holdings failed to load instead of not found when the list errors', () => {
    holdings.data = []
    holdings.isError = true
    renderDialog({ mode: 'edit', holdingId: 7 })
    expect(screen.getByText(esAR.investments.holdings.loadFailed)).toBeInTheDocument()
    expect(screen.queryByText('No encontramos esa tenencia.')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).not.toBeInTheDocument()
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
    expect(screen.getByLabelText('Cantidad a vender')).toHaveValue('100')
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
    expect(screen.getAllByRole('textbox')).toHaveLength(1)

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
    expect(price).toHaveValue('800')
    await user.clear(price)
    await user.type(price, '812.5')

    expect(screen.getByTestId('sell-estimate')).toHaveTextContent(/81\.250,00/)
    await user.click(screen.getByRole('button', { name: /Confirmar venta y liquidar/i }))

    await waitFor(() =>
      expect(sellMutateAsync).toHaveBeenCalledWith({
        id: 10,
        body: { quantity: '100', price: '812.5', destinationCbu: '0720000000000000000011' },
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

  it('rejects more than six decimals in the quantity and the manual price', async () => {
    const user = userEvent.setup()
    renderSell(ggal)

    const quantity = screen.getByLabelText('Cantidad a vender')
    await user.clear(quantity)
    await user.type(quantity, '1.1234567')
    expect(screen.getByRole('alert')).toHaveTextContent('La cantidad admite hasta 6 decimales')
    expect(screen.queryByTestId('sell-estimate')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Vender .* y liquidar$/ })).toBeDisabled()

    await user.clear(quantity)
    await user.type(quantity, '1.123456')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    await user.click(screen.getByRole('switch', { name: 'Precio de mercado' }))
    const price = screen.getByLabelText(/Precio de venta/)
    await user.clear(price)
    await user.type(price, '812.1234567')
    expect(screen.getByRole('alert')).toHaveTextContent('El precio admite hasta 6 decimales')
    expect(screen.getByRole('button', { name: /^Vender .* y liquidar$/ })).toBeDisabled()

    expect(sellMutateAsync).not.toHaveBeenCalled()
  })

  it('prefills the manual price with at most six decimals', async () => {
    const user = userEvent.setup()
    renderSell({ ...ggal, currentPrice: 812.123456789 })

    await user.click(screen.getByRole('switch', { name: 'Precio de mercado' }))

    expect(screen.getByLabelText(/Precio de venta/)).toHaveValue('812.123457')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it.each(['1e-7', '1.5e-7'])('rejects the exponent value %s in the quantity and the manual price', async (value) => {
    const user = userEvent.setup()
    renderSell(ggal)

    const quantity = screen.getByLabelText('Cantidad a vender')
    fireEvent.change(quantity, { target: { value } })
    expect(screen.getByRole('alert')).toHaveTextContent('Ingresá un número válido (ej: 1,5).')
    expect(screen.getByRole('button', { name: /^Vender .* y liquidar$/ })).toBeDisabled()

    fireEvent.change(quantity, { target: { value: '10' } })
    await user.click(screen.getByRole('switch', { name: 'Precio de mercado' }))
    fireEvent.change(screen.getByLabelText(/Precio de venta/), { target: { value } })
    expect(screen.getByRole('alert')).toHaveTextContent('Ingresá un número válido (ej: 1,5).')
    expect(screen.getByRole('button', { name: 'Vender 10 y liquidar' })).toBeDisabled()

    expect(sellMutateAsync).not.toHaveBeenCalled()
  })

  it('accepts a comma as the decimal separator and sends a normalised decimal', async () => {
    const user = userEvent.setup()
    renderSell(ggal)

    fireEvent.change(screen.getByLabelText('Cantidad a vender'), { target: { value: '1,5' } })
    await user.click(screen.getByRole('switch', { name: 'Precio de mercado' }))
    fireEvent.change(screen.getByLabelText(/Precio de venta/), { target: { value: '812,50' } })
    await user.click(screen.getByRole('button', { name: /^Vender .* y liquidar$/ }))

    await waitFor(() =>
      expect(sellMutateAsync).toHaveBeenCalledWith({
        id: 10,
        body: { quantity: '1.5', price: '812.5', destinationCbu: '0720000000000000000011' },
      }),
    )
  })

  it('prefills a tiny market quote as a plain decimal', async () => {
    const user = userEvent.setup()
    renderSell({ ...ggal, currentPrice: 0.0000012 })

    await user.click(screen.getByRole('switch', { name: 'Precio de mercado' }))
    const price = screen.getByLabelText(/Precio de venta/) as HTMLInputElement
    expect(price.value).toBe('0.000001')
    await user.click(screen.getByRole('button', { name: /Confirmar venta y liquidar/i }))

    await waitFor(() =>
      expect(sellMutateAsync).toHaveBeenCalledWith({
        id: 10,
        body: { quantity: '100', price: '0.000001', destinationCbu: '0720000000000000000011' },
      }),
    )
  })

  it('accepts a trailing decimal point as zero decimals', async () => {
    const user = userEvent.setup()
    renderSell(ggal)

    const quantity = screen.getByLabelText('Cantidad a vender')
    await user.clear(quantity)
    await user.type(quantity, '10.')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Vender 10 y liquidar' }))

    await waitFor(() =>
      expect(sellMutateAsync).toHaveBeenCalledWith({
        id: 10,
        body: { quantity: '10', price: null, destinationCbu: '0720000000000000000011' },
      }),
    )
  })

  it('ties the error to the field that owns it', async () => {
    const user = userEvent.setup()
    renderSell(ggal)

    const quantity = screen.getByLabelText('Cantidad a vender')
    expect(quantity).toHaveAttribute('aria-invalid', 'false')
    expect(quantity).not.toHaveAccessibleDescription()

    fireEvent.change(quantity, { target: { value: '150' } })
    expect(quantity).toHaveAttribute('aria-invalid', 'true')
    expect(quantity).toHaveAccessibleDescription('No podés vender más de 100')

    fireEvent.change(quantity, { target: { value: '10' } })
    await user.click(screen.getByRole('switch', { name: 'Precio de mercado' }))
    const price = screen.getByLabelText(/Precio de venta/)
    fireEvent.change(price, { target: { value: '0' } })
    expect(quantity).toHaveAttribute('aria-invalid', 'false')
    expect(quantity).not.toHaveAccessibleDescription()
    expect(price).toHaveAttribute('aria-invalid', 'true')
    expect(price).toHaveAccessibleDescription('El precio debe ser mayor a cero')

    fireEvent.change(price, { target: { value: '800' } })
    expect(price).toHaveAttribute('aria-invalid', 'false')
    expect(price).not.toHaveAccessibleDescription()
  })

  it('quotes bonds per 100 VN, starts the manual price empty and shows no estimate', async () => {
    const user = userEvent.setup()
    renderSell(al30)

    expect(screen.getByTestId('sell-bond-note')).toHaveTextContent('cada 100 VN')
    expect(screen.queryByTestId('sell-estimate')).not.toBeInTheDocument()

    await user.click(screen.getByRole('switch', { name: 'Precio de mercado' }))
    const price = screen.getByLabelText('Precio de venta (cada 100 VN)')
    expect(price).toHaveValue('')
    await user.type(price, '80500')
    await user.click(screen.getByRole('button', { name: /Confirmar venta y liquidar/i }))

    await waitFor(() =>
      expect(sellMutateAsync).toHaveBeenCalledWith({
        id: 11,
        body: { quantity: '1000', price: '80500', destinationCbu: '0720000000000000000011' },
      }),
    )
  })

  it('caps its height and scrolls so the confirm button is never clipped on a short screen', () => {
    renderSell(ggal)
    expect(screen.getByRole('dialog')).toHaveClass('max-h-[90vh]', 'overflow-y-auto')
  })

  it('shows the exact held quantity and reports the exact sold quantity', async () => {
    const user = userEvent.setup()
    const exact = '123456789012.123456'
    sellMutateAsync.mockResolvedValueOnce({
      holdingId: 10, soldQuantity: exact, remainingQuantity: '1', proceeds: '8000',
      bookedAmount: '0', currency: 'ARS', closed: false,
    })
    renderSell({ ...ggal, quantity: Number(exact), exactQuantity: exact })

    expect(screen.getByText(/123\.456\.789\.012,123456 unidades/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Confirmar venta y liquidar/i }))

    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith('Vendiste 123.456.789.012,123456 de GGAL', expect.anything()),
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

    expect(screen.getByLabelText('Cantidad a vender')).toHaveValue('40')
    expect(screen.getByRole('switch', { name: 'Precio de mercado' })).not.toBeChecked()
    expect(screen.getByLabelText(/Precio de venta/)).toHaveValue('812.5')

    await user.click(screen.getByRole('button', { name: 'Vender 40 y liquidar' }))

    await waitFor(() =>
      expect(sellMutateAsync).toHaveBeenCalledWith({
        id: 10,
        body: { quantity: '40', price: '812.5', destinationCbu: '0720000000000000000011' },
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

    expect(screen.getByLabelText('Cantidad a vender')).toHaveValue('100')
    expect(screen.getByRole('switch', { name: 'Precio de mercado' })).toBeChecked()

    await user.clear(screen.getByLabelText('Cantidad a vender'))
    await user.type(screen.getByLabelText('Cantidad a vender'), '40')
    rerender(al30)

    expect(screen.getByLabelText('Cantidad a vender')).toHaveValue('1000')
  })

  it('sends the exact held quantity when selling everything', async () => {
    const user = userEvent.setup()
    const precise = { ...ggal, quantity: Number('123456789012.123456'), exactQuantity: '123456789012.123456' }
    renderSell(precise)

    await user.clear(screen.getByLabelText('Cantidad a vender'))
    await user.type(screen.getByLabelText('Cantidad a vender'), '40')
    await user.click(screen.getByRole('button', { name: 'Todo' }))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Confirmar venta y liquidar/i }))

    await waitFor(() =>
      expect(sellMutateAsync).toHaveBeenCalledWith({
        id: 10,
        body: { quantity: '123456789012.123456', price: null, destinationCbu: '0720000000000000000011' },
      }),
    )
  })

  describe('with a quantity beyond double precision', () => {
    const precise = { ...ggal, quantity: Number('123456789012.123456'), exactQuantity: '123456789012.123456' }

    it('rejects one millionth above the held quantity', () => {
      renderSell(precise)

      const quantity = screen.getByLabelText('Cantidad a vender')
      fireEvent.change(quantity, { target: { value: '123456789012.123457' } })

      expect(screen.getByRole('alert')).toHaveTextContent('No podés vender más de 123.456.789.012,123456')
      expect(quantity).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByRole('button', { name: /^Vender .* y liquidar$/ })).toBeDisabled()
      expect(sellMutateAsync).not.toHaveBeenCalled()
    })

    it('sells one millionth below the held quantity as a partial sale', async () => {
      const user = userEvent.setup()
      renderSell(precise)

      fireEvent.change(screen.getByLabelText('Cantidad a vender'), { target: { value: '123456789012.123455' } })
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /Confirmar venta y liquidar/i })).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: /^Vender .* y liquidar$/ }))

      await waitFor(() =>
        expect(sellMutateAsync).toHaveBeenCalledWith({
          id: 10,
          body: { quantity: '123456789012.123455', price: null, destinationCbu: '0720000000000000000011' },
        }),
      )
    })
  })

  it('treats an unusable held quantity as nothing to sell instead of crashing', () => {
    renderSell({ ...ggal, quantity: Number.NaN })

    fireEvent.change(screen.getByLabelText('Cantidad a vender'), { target: { value: '1' } })

    expect(screen.getByRole('alert')).toHaveTextContent('No podés vender más de 0')
    expect(screen.getByRole('button', { name: /^Vender .* y liquidar$/ })).toBeDisabled()
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

  it('renders MarketsTab and hands a buy to its caller with the full prefill', async () => {
    const user = userEvent.setup()
    const onBuy = vi.fn()
    renderWithIntl(<MarketsTab onBuy={onBuy} />)

    expect(screen.getByRole('heading', { name: 'GGAL' })).toBeInTheDocument()
    expect(screen.getByText('SPY')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Registrar compra de GGAL/i }))

    expect(onBuy).toHaveBeenCalledWith({ ticker: 'GGAL', name: undefined, price: 4850, currency: 'ARS' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('labels the chart ranges and formats the variations as shared percents', () => {
    renderWithIntl(<MarketsTab onBuy={vi.fn()} />)

    for (const label of ['30D', '90D', '1A', 'TODO']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
    expect(screen.queryByRole('button', { name: 'D30' })).not.toBeInTheDocument()
    expect(screen.getByText('+3,45 %')).toBeInTheDocument()
    expect(screen.getByText('+1,80 %')).toBeInTheDocument()
  })
})
