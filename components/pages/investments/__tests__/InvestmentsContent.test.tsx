import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { InvestmentsContent } from '../InvestmentsContent'
import fixture from '@/lib/api/bff/__fixtures__/investments.json'
import type { InvestmentsBff } from '@/lib/api/bff/types'
import { useCarteraViewStore } from '@/lib/store/carteraView.store'
import { useHoldingDraftStore } from '@/lib/store/holdingDraft.store'
import type { Holding } from '@/types/investments'

if (!Element.prototype.hasPointerCapture) Element.prototype.hasPointerCapture = () => false
if (!Element.prototype.setPointerCapture) Element.prototype.setPointerCapture = () => {}
if (!Element.prototype.releasePointerCapture) Element.prototype.releasePointerCapture = () => {}

const { holdingsMock, createMutateAsync, updateMutateAsync, sellMutateAsync } = vi.hoisted(() => ({
  holdingsMock: { data: [] as Holding[], isError: false, refetch: vi.fn() },
  createMutateAsync: vi.fn(async () => ({})),
  updateMutateAsync: vi.fn(async () => ({})),
  sellMutateAsync: vi.fn(),
}))

vi.mock('@/lib/hooks/useInvestmentsPage', () => ({
  useInvestmentsPage: vi.fn(),
}))

vi.mock('@/lib/hooks/useBanks', () => ({
  useBanks: () => ({
    banks: [
      {
        bankNumber: '017',
        name: 'BBVA',
        accounts: [{ cbu: '0170099200000000000017', name: 'Cuenta Corriente', currency: 'ARS', balance: '100000' }],
      },
    ],
    isLoading: false,
  }),
}))

vi.mock('@/lib/hooks/useInvestments', () => ({
  useHoldings: () => ({ data: holdingsMock.data, isLoading: false, isError: holdingsMock.isError, refetch: holdingsMock.refetch }),
  useCreateHolding: () => ({ mutateAsync: createMutateAsync, isPending: false }),
  useUpdateHolding: () => ({ mutateAsync: updateMutateAsync, isPending: false }),
  useSellHolding: () => ({ mutateAsync: sellMutateAsync, isPending: false }),
  useTickerSearch: () => ({ data: [], isLoading: false }),
  useTickerResearch: (ticker: string | null) => ({
    data: ticker
      ? { ticker, currency: 'ARS', currentPrice: 4850, variation: 1.2, series: [
          { date: '2026-08-01', price: 4500 },
          { date: '2026-09-01', price: 4850 },
        ] }
      : null,
    isLoading: false,
    isError: false,
  }),
  useMarketDiscovery: () => ({ data: { marketDataAvailable: false, opportunities: [] }, isLoading: false }),
}))

import { useInvestmentsPage } from '@/lib/hooks/useInvestmentsPage'

const bff = fixture as unknown as InvestmentsBff
const observedAt = '2026-09-29T10:00:00Z'
const ars = (amount: string) => ({ amount, currency: 'ARS', secondary: null })

function renderInvestments(
  data: InvestmentsBff,
  { searchParams = '', onUrlUpdate }: { searchParams?: string; onUrlUpdate?: OnUrlUpdateFunction } = {},
) {
  vi.mocked(useInvestmentsPage).mockReturnValue({ data, isLoading: false, refetch: vi.fn() } as any)
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const ui = () => (
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory resetUrlUpdateQueueOnMount={false}>
        <QueryClientProvider client={queryClient}>
          <InvestmentsContent />
        </QueryClientProvider>
      </NuqsTestingAdapter>
    </NextIntlClientProvider>
  )
  const view = render(ui())
  return {
    ...view,
    rerenderWith(next: InvestmentsBff) {
      vi.mocked(useInvestmentsPage).mockReturnValue({ data: next, isLoading: false, refetch: vi.fn() } as any)
      view.rerender(ui())
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  holdingsMock.data = []
  holdingsMock.isError = false
  useHoldingDraftStore.setState({ draft: null })
})

describe('InvestmentsContent renders the real contract', () => {
  it('renders portfolio kpis from the kpis section', () => {
    renderInvestments(bff)
    expect(screen.getByTestId('inv-kpi-market-value')).toBeInTheDocument()
    expect(screen.getByTestId('inv-kpi-pnl-pct')).toBeInTheDocument()
  })

  it('opens on Resumen with four tabs and no header create button', () => {
    renderInvestments(bff)
    const tabs = screen.getAllByRole('tab').map((tab) => tab.textContent)
    expect(tabs).toEqual(['Resumen', 'Cartera', 'Mercados', 'Operaciones'])
    expect(screen.getByRole('tab', { name: 'Resumen' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByTestId('position-row')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Registrar inversión$/ })).not.toBeInTheDocument()
  })

  it('maps the legacy ?tab=portfolio link to Cartera', () => {
    renderInvestments(bff, { searchParams: '?tab=portfolio' })
    expect(screen.getByRole('tab', { name: 'Cartera' })).toHaveAttribute('aria-selected', 'true')
  })

  it('writes the new tab value when a tab is clicked', async () => {
    const user = userEvent.setup()
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>()
    renderInvestments(bff, { onUrlUpdate })
    await user.click(screen.getByRole('tab', { name: 'Operaciones' }))
    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalled())
    expect(onUrlUpdate.mock.calls.at(-1)![0].searchParams.get('tab')).toBe('operaciones')
    expect(screen.getByRole('tab', { name: 'Operaciones' })).toHaveAttribute('aria-selected', 'true')
  })

  it('renders position rows on Cartera', () => {
    const withPositions = {
      ...bff,
      positions: {
        status: 'OK' as const,
        observedAt,
        data: [
          {
            holdingId: 42,
            ticker: 'YPFD',
            name: 'YPF S.A.',
            assetType: 'STOCK',
            quantity: 100,
            avgCost: ars('12000'),
            price: ars('15000'),
            marketValue: ars('1500000'),
            pnl: ars('300000'),
            pnlPct: 25,
            bankNumber: '017',
          },
        ],
      },
    }
    renderInvestments(withPositions as InvestmentsBff, { searchParams: '?tab=cartera' })
    expect(screen.getAllByTestId('position-row')).toHaveLength(1)
  })

  it('renders the empty state on Cartera when positions are empty', () => {
    renderInvestments({ ...bff, positions: { ...bff.positions!, data: [] } } as InvestmentsBff, {
      searchParams: '?tab=cartera',
    })
    expect(screen.getByTestId('positions-empty')).toBeInTheDocument()
  })

  it('renders no error box when the market strip is unavailable', async () => {
    renderInvestments({
      ...bff,
      marketStrip: { status: 'UNAVAILABLE', observedAt: bff.marketStrip!.observedAt, data: null },
    } as InvestmentsBff)

    expect(await screen.findByTestId('inv-kpi-market-value')).toBeInTheDocument()
    expect(screen.queryByText(esAR.sections.unavailable)).not.toBeInTheDocument()
    expect(screen.queryByTestId('market-strip')).not.toBeInTheDocument()
  })

  it('still shows the error box for other unavailable sections', async () => {
    renderInvestments({
      ...bff,
      kpis: { status: 'UNAVAILABLE', observedAt: bff.kpis!.observedAt, data: null },
    } as InvestmentsBff)

    expect(await screen.findAllByText(esAR.sections.unavailable)).not.toHaveLength(0)
  })
})

describe('Investments layout on short screens and phones', () => {
  it('hides the subtitle in the compact frame and lets the four tabs share a phone width', () => {
    renderInvestments(bff)
    expect(screen.getByText(esAR.investments.subtitle)).toHaveClass('short:hidden')
    expect(screen.getByRole('tablist')).toHaveClass('max-md:w-full')
    screen.getAllByRole('tab').forEach((tab) => {
      expect(tab).toHaveClass('max-md:min-w-0', 'max-md:text-xs')
      expect(tab).not.toHaveClass('min-w-0')
    })
  })

  it('wraps the market strip on phones instead of scrolling it sideways', () => {
    renderInvestments({
      ...bff,
      marketStrip: {
        status: 'OK',
        observedAt,
        data: [{ code: 'MERVAL', label: 'Merval', value: 2150000, variation: 1.2, unit: 'PERCENT', observedAt }],
      },
    } as InvestmentsBff)
    const strip = screen.getByTestId('market-strip')
    expect(strip.querySelector('.max-md\\:flex-wrap')).not.toBeNull()
    expect(strip.querySelector('.overflow-x-auto')).toBeNull()
  })

  it('keeps every KPI amount on one line', () => {
    renderInvestments(bff)
    expect(screen.getByTestId('inv-kpi-market-value').querySelector('[data-amount]')).not.toBeNull()
    expect(screen.getByTestId('inv-kpi-pnl-pct').querySelector('[data-amount]')).toHaveClass('whitespace-nowrap')
  })

  it('prints the performance KPI as a shared percent in the gain or loss tone', () => {
    const kpisWith = (pnlPct: number) =>
      ({ ...bff, kpis: { ...bff.kpis!, data: { ...bff.kpis!.data!, pnlPct } } }) as InvestmentsBff
    const { unmount } = renderInvestments(kpisWith(12.345))
    expect(screen.getByTestId('inv-kpi-pnl-pct')).toHaveTextContent('+12,35 %')
    expect(screen.getByTestId('inv-kpi-pnl-pct').firstElementChild).toHaveClass('text-gain')
    unmount()

    renderInvestments(kpisWith(-3.5))
    expect(screen.getByTestId('inv-kpi-pnl-pct')).toHaveTextContent('−3,50 %')
    expect(screen.getByTestId('inv-kpi-pnl-pct').firstElementChild).toHaveClass('text-loss')
  })

  it('stacks Operaciones into three columns on a phone', async () => {
    renderInvestments(bff, { searchParams: '?tab=operaciones' })
    expect(screen.getByRole('columnheader', { name: esAR.investments.operations.colDate })).toHaveClass('max-md:hidden')
    expect(screen.getByRole('columnheader', { name: esAR.common.quantity })).toHaveClass('max-md:hidden')
    expect(screen.getByRole('columnheader', { name: esAR.common.ticker })).not.toHaveClass('max-md:hidden')
  })
})

describe('Mercados', () => {
  it('keeps the ticker search above the chart', () => {
    renderInvestments(bff, { searchParams: '?tab=mercados' })
    expect(screen.getByPlaceholderText(esAR.investments.market.searchPlaceholder)).toBeInTheDocument()
  })

  it('stacks the chart and Descubrir in one shrinkable column below the side-by-side width', () => {
    renderInvestments(bff, { searchParams: '?tab=mercados' })
    expect(screen.getByTestId('markets-grid')).toHaveClass('grid-cols-1')
  })
})

describe('Resumen range', () => {
  it('requests the range picked on Resumen and writes it to the URL', async () => {
    const user = userEvent.setup()
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>()
    renderInvestments(bff, { onUrlUpdate })
    expect(vi.mocked(useInvestmentsPage)).toHaveBeenLastCalledWith(expect.objectContaining({ range: '1M' }))

    await user.click(within(screen.getByTestId('evolution-card')).getByRole('button', { name: '3M' }))

    await waitFor(() =>
      expect(vi.mocked(useInvestmentsPage)).toHaveBeenLastCalledWith(expect.objectContaining({ range: '3M' })),
    )
    await waitFor(() => expect(onUrlUpdate.mock.calls.at(-1)![0].searchParams.get('range')).toBe('3M'))
  })

  it('requests the range already in the URL', () => {
    renderInvestments(bff, { searchParams: '?range=3M' })
    expect(vi.mocked(useInvestmentsPage)).toHaveBeenCalledWith(expect.objectContaining({ range: '3M' }))
  })

  it('falls back to one month for an unknown range in the URL', () => {
    renderInvestments(bff, { searchParams: '?range=bogus' })
    expect(vi.mocked(useInvestmentsPage)).toHaveBeenLastCalledWith(expect.objectContaining({ range: '1M' }))
    expect(vi.mocked(useInvestmentsPage)).not.toHaveBeenCalledWith(expect.objectContaining({ range: 'bogus' }))
  })
})

const position = (holdingId: number, ticker: string, assetType: string, value: string, currency = 'ARS') => ({
  holdingId,
  ticker,
  name: `${ticker} S.A.`,
  assetType,
  quantity: 100,
  avgCost: { amount: '100', currency, secondary: null },
  price: { amount: String(Number(value) / 100), currency, secondary: null },
  marketValue: { amount: value, currency, secondary: null },
  pnl: { amount: '0', currency, secondary: null },
  pnlPct: 0,
  bankNumber: '017',
})

const typeSlice = (assetType: string, amount: string, pct: number, count: number) => ({
  label: assetType,
  assetType,
  amount: ars(amount),
  cost: ars(amount),
  pnl: ars('0'),
  pnlPct: 0,
  pct,
  count,
})

const cartera: InvestmentsBff = {
  ...bff,
  kpis: { status: 'OK', observedAt, data: { marketValue: ars('10000000'), cost: ars('10000000'), pnl: ars('0'), pnlPct: 0 } },
  positions: {
    status: 'OK',
    observedAt,
    data: [
      position(1, 'GGAL', 'STOCK', '1500000'),
      position(2, 'GD30', 'BOND', '3000000'),
      position(3, 'MELI', 'CEDEAR', '4000000'),
      position(4, 'AL30', 'BOND', '1500000'),
    ],
  },
  composition: {
    status: 'OK',
    observedAt,
    data: [typeSlice('BOND', '4500000', 45, 2), typeSlice('CEDEAR', '4000000', 40, 1), typeSlice('STOCK', '1500000', 15, 1)],
  },
} as InvestmentsBff

const groupOf = (key: string) =>
  screen.getAllByTestId('position-group').find((g) => g.getAttribute('data-asset-type') === key)!

describe('Cartera', () => {
  it('groups holdings by type in fixed order with subtotals from the composition', () => {
    renderInvestments(cartera, { searchParams: '?tab=cartera' })

    expect(screen.getAllByTestId('position-group').map((g) => g.getAttribute('data-asset-type'))).toEqual([
      'BOND',
      'CEDEAR',
      'STOCK',
    ])
    const bonds = groupOf('BOND')
    expect(within(bonds).getAllByTestId('position-row').map((r) => within(r).getByRole('link').textContent)).toEqual([
      'AL30',
      'GD30',
    ])
    expect(within(bonds).getByRole('button', { name: /Bonos/ })).toHaveTextContent('2 posiciones')
    expect(within(bonds).getByTestId('group-subtotal')).toHaveTextContent(/4\.500\.000,00/)
    expect(within(bonds).getByText('45,0 %')).toBeInTheDocument()
  })

  it('contains the table caption inside its scroller so it never stretches the page', () => {
    renderInvestments(cartera, { searchParams: '?tab=cartera' })
    expect(screen.getByTestId('positions-scroll')).toHaveClass('relative')
  })

  it('shows each row share of the portfolio', () => {
    renderInvestments(cartera, { searchParams: '?tab=cartera' })
    const ggal = within(groupOf('STOCK')).getByTestId('position-row')
    expect(within(ggal).getByText('15,0 %')).toBeInTheDocument()
  })

  it('collapses a group on click', async () => {
    const user = userEvent.setup()
    renderInvestments(cartera, { searchParams: '?tab=cartera' })
    const toggle = within(groupOf('BOND')).getByRole('button', { name: /Bonos/ })

    await user.click(toggle)

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(within(groupOf('BOND')).queryAllByTestId('position-row')).toHaveLength(0)
    expect(within(groupOf('CEDEAR')).getAllByTestId('position-row')).toHaveLength(1)
  })

  it('groups rows without subtotals when composition is unavailable', () => {
    renderInvestments(
      { ...cartera, composition: { status: 'UNAVAILABLE', observedAt, data: null } } as InvestmentsBff,
      { searchParams: '?tab=cartera' },
    )
    const bonds = groupOf('BOND')
    expect(within(bonds).getByRole('button', { name: /Bonos/ })).toHaveTextContent('2 posiciones')
    expect(within(bonds).getByTestId('group-subtotal')).toBeEmptyDOMElement()
    expect(within(bonds).getAllByTestId('position-row')).toHaveLength(2)
    expect(document.body.textContent).not.toMatch(/NaN/)
  })

  it("sells in the holding's own currency", async () => {
    const user = userEvent.setup()
    holdingsMock.data = [
      {
        id: 1, userId: 1, bankNumber: '017', ticker: 'GGAL', name: 'GGAL S.A.', assetType: 'STOCK',
        quantity: 100, avgPurchasePrice: 12000, currency: 'ARS',
        notifyGainThresholdPct: null, notifyLossThresholdPct: null, createdAt: '', updatedAt: '',
      },
    ]
    const usdView = {
      ...cartera,
      positions: { status: 'OK', observedAt, data: [position(1, 'GGAL', 'STOCK', '1000', 'USD')] },
    } as InvestmentsBff
    renderInvestments(usdView, { searchParams: '?tab=cartera&currency=USD_MEP' })

    await user.click(within(screen.getByTestId('position-row')).getByRole('button', { name: 'Vender' }))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/Vender posición de GGAL/)).toBeInTheDocument()
    expect(dialog.textContent).not.toMatch(/US\$/)
    expect(within(dialog).getByText('Costo promedio').parentElement).toHaveTextContent(/\$\s?12\.000,00/)
    expect(within(dialog).queryByTestId('sell-estimate')).not.toBeInTheDocument()
  })

  it('explains why Editar and Vender are disabled when the holdings fail to load and retries them', async () => {
    const user = userEvent.setup()
    holdingsMock.isError = true
    renderInvestments(cartera, { searchParams: '?tab=cartera' })

    const notice = esAR.investments.cartera.holdingsUnavailable
    const row = within(within(groupOf('STOCK')).getByTestId('position-row'))
    for (const name of ['Editar', 'Vender']) {
      const action = row.getByRole('button', { name })
      expect(action).toBeDisabled()
      expect(action).toHaveAttribute('title', notice)
      expect(action).toHaveAccessibleDescription(notice)
    }

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(holdingsMock.refetch).toHaveBeenCalled()
  })
})

const tickers = () => screen.getAllByTestId('position-row').map((r) => within(r).getByRole('link').textContent)

describe('Cartera view options', () => {
  const resetView = () => {
    useCarteraViewStore.getState().reset()
    localStorage.clear()
  }

  beforeEach(resetView)
  afterEach(() => {
    resetView()
    vi.unstubAllGlobals()
  })

  it('switches to one table with a type column and type chips', async () => {
    const user = userEvent.setup()
    renderInvestments(cartera, { searchParams: '?tab=cartera' })
    expect(screen.queryByRole('columnheader', { name: esAR.investments.cartera.colType })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: esAR.investments.cartera.view }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: esAR.investments.cartera.groupByType }))
    await user.keyboard('{Escape}')

    expect(screen.queryAllByTestId('position-group')).toHaveLength(0)
    expect(screen.getByRole('columnheader', { name: esAR.investments.cartera.colType })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: esAR.investments.groups.BOND }))
    expect(tickers()).toEqual(['AL30', 'GD30'])
    expect(screen.getByTestId('cartera-filter-summary')).toHaveTextContent('Mostrando 2 de 4 posiciones')
  })

  it('shows the type column unchecked while grouped, since it is not displayed', async () => {
    const user = userEvent.setup()
    renderInvestments(cartera, { searchParams: '?tab=cartera' })

    await user.click(screen.getByRole('button', { name: esAR.investments.cartera.view }))
    const type = screen.getByRole('menuitemcheckbox', { name: esAR.investments.cartera.colType })
    expect(type).toHaveAttribute('aria-checked', 'false')
    expect(type).toHaveAttribute('data-disabled')

    await user.click(screen.getByRole('menuitemcheckbox', { name: esAR.investments.cartera.groupByType }))
    expect(screen.getByRole('menuitemcheckbox', { name: esAR.investments.cartera.colType })).toHaveAttribute('aria-checked', 'true')
  })

  it('hides a column from the header and from every row', async () => {
    const user = userEvent.setup()
    renderInvestments(cartera, { searchParams: '?tab=cartera' })
    const cellsBefore = screen.getAllByTestId('position-row')[0].children.length

    await user.click(screen.getByRole('button', { name: esAR.investments.cartera.view }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: esAR.investments.tabs.colAvgCost }))
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('columnheader', { name: esAR.investments.tabs.colAvgCost })).not.toBeInTheDocument()
    expect(screen.getAllByTestId('position-row')[0].children).toHaveLength(cellsBefore - 1)
  })

  it('sorts the flat table by total value, largest first', async () => {
    const user = userEvent.setup()
    useCarteraViewStore.getState().setGrouped(false)
    renderInvestments(cartera, { searchParams: '?tab=cartera' })

    await user.click(screen.getByRole('button', { name: esAR.investments.shared.totalValue }))

    expect(tickers()).toEqual(['MELI', 'GD30', 'AL30', 'GGAL'])
    expect(screen.getByRole('columnheader', { name: esAR.investments.shared.totalValue })).toHaveAttribute(
      'aria-sort',
      'descending',
    )
  })

  it('filters by ticker or name and keeps the type-wide subtotal', async () => {
    const user = userEvent.setup()
    renderInvestments(cartera, { searchParams: '?tab=cartera' })

    await user.type(screen.getByRole('searchbox', { name: esAR.investments.cartera.filterLabel }), 'gd')

    expect(tickers()).toEqual(['GD30'])
    expect(screen.getAllByTestId('position-group').map((g) => g.getAttribute('data-asset-type'))).toEqual(['BOND'])
    expect(within(groupOf('BOND')).getByTestId('group-subtotal')).toHaveTextContent(/4\.500\.000,00/)
    const summary = screen.getByTestId('cartera-filter-summary')
    expect(summary).toHaveTextContent('Mostrando 1 de 4 posiciones')
    expect(summary).toHaveTextContent(esAR.investments.cartera.subtotalsNote)
  })

  it('never scrolls sideways on desktop: truncating text columns, sticky actions, dense below 1600', async () => {
    const user = userEvent.setup()
    renderInvestments(cartera, { searchParams: '?tab=cartera' })
    await user.click(screen.getByRole('button', { name: esAR.investments.cartera.view }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: esAR.investments.cartera.colBank }))
    await user.keyboard('{Escape}')

    const table = screen.getByTestId('cartera-table')
    expect(table).toHaveClass('w-full', 'table-auto', 'max-[1600px]:text-[12.5px]')
    const name = screen.getByRole('columnheader', { name: esAR.investments.tabs.colName })
    expect(name).toHaveClass('w-[26%]', 'max-[1600px]:px-1.5')
    const row = screen.getAllByTestId('position-row')[0]
    const cells = [...row.children]
    expect(cells[1]).toHaveClass('max-w-0', 'truncate')
    expect(cells[1]).toHaveAttribute('title')
    expect(cells.at(-1)).toHaveClass('md:sticky', 'md:right-0', 'bg-card')
    expect(within(cells.at(-1) as HTMLElement).getAllByRole('button').map((b) => b.textContent)).toEqual(['Editar', 'Vender'])
    expect(cells.at(-1)!.querySelector('svg')).toBeNull()
  })

  it('keeps every money cell on one line, group subtotals and P&L included', () => {
    renderInvestments(cartera, { searchParams: '?tab=cartera' })

    const groupHeader = groupOf('BOND').querySelector('tr')!
    const moneyCells = [
      ...screen.getAllByTestId('position-row').flatMap((r) => [...r.children]),
      ...groupHeader.querySelectorAll('td'),
    ].filter((cell) => /[$%]/.test(cell.textContent ?? ''))

    expect(moneyCells.length).toBeGreaterThanOrEqual(4 * 6 + 4)
    moneyCells.forEach((cell) => expect(cell).toHaveClass('whitespace-nowrap'))
  })

  it('shows only the ticker and the actions on a phone, whatever columns are saved', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(max-width: 767px)',
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }))
    useCarteraViewStore.getState().toggleColumn('bank')
    renderInvestments(cartera, { searchParams: '?tab=cartera' })

    expect(screen.getAllByRole('columnheader').map((h) => h.textContent)).toEqual([esAR.common.ticker, esAR.common.actions])
    const sell = screen.getByRole('button', { name: 'Vender GGAL' })
    expect(sell).toHaveClass('h-7', 'w-7')
    expect(sell.closest('td')).not.toHaveClass('sticky')
    const edit = screen.getByRole('button', { name: 'Editar GGAL' })
    expect(edit).toHaveClass('h-7', 'w-7')
    expect(edit.compareDocumentPosition(sell) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    const header = groupOf('BOND').querySelector('tr')!
    expect(header.children).toHaveLength(1)
    expect(header.children[0]).toHaveAttribute('colspan', '2')
    expect(within(groupOf('BOND')).queryByTestId('group-subtotal')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: esAR.investments.cartera.view }))
    expect(screen.getByTestId('cartera-phone-note')).toHaveTextContent(esAR.investments.cartera.phoneColumnsNote)
    expect(screen.queryByRole('menuitemcheckbox', { name: esAR.investments.tabs.colAvgCost })).not.toBeInTheDocument()
    expect(screen.getByRole('menuitemcheckbox', { name: esAR.investments.cartera.groupByType })).toBeInTheDocument()
  })

  it('explains a disabled phone Editar and Vender like the desktop ones', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(max-width: 767px)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    holdingsMock.isError = true
    renderInvestments(cartera, { searchParams: '?tab=cartera' })

    const notice = esAR.investments.cartera.holdingsUnavailable
    for (const name of ['Editar GGAL', 'Vender GGAL']) {
      const action = screen.getByRole('button', { name })
      expect(action).toBeDisabled()
      expect(action).toHaveAttribute('title', notice)
      expect(action).toHaveAccessibleDescription(notice)
    }
  })
})

const nativeGgal = {
  id: 1, userId: 1, bankNumber: '017', ticker: 'GGAL', name: 'GGAL S.A.', assetType: 'STOCK' as const,
  quantity: 100, avgPurchasePrice: 12000, currency: 'ARS',
  notifyGainThresholdPct: null, notifyLossThresholdPct: null, createdAt: '', updatedAt: '',
}

const rowOf = (ticker: string) =>
  screen.getAllByTestId('position-row').find((r) => within(r).getByRole('link').textContent === ticker)!

describe('one create entry point', () => {
  it.each([
    ['resumen', 0],
    ['cartera', 1],
    ['mercados', 0],
    ['operaciones', 0],
  ] as const)('renders %s with %i register triggers', (tab, count) => {
    renderInvestments(cartera, { searchParams: `?tab=${tab}` })
    expect(screen.queryAllByTestId('register-holding-trigger')).toHaveLength(count)
  })

  it('opens the one dialog from the empty state', async () => {
    const user = userEvent.setup()
    renderInvestments({ ...cartera, positions: { status: 'OK', observedAt, data: [] } } as InvestmentsBff, {
      searchParams: '?tab=cartera',
    })
    expect(screen.getAllByTestId('register-holding-trigger')).toHaveLength(1)

    await user.click(screen.getByTestId('positions-empty-register'))

    expect(await screen.findByRole('heading', { name: 'Registrar inversión' })).toBeInTheDocument()
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
  })

  it('opens the dialog once from ?add and drops the param', async () => {
    const user = userEvent.setup()
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>()
    const view = renderInvestments(cartera, { searchParams: '?add=ggal', onUrlUpdate })

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByDisplayValue('GGAL')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Cartera', hidden: true })).toHaveAttribute('aria-selected', 'true')
    await waitFor(() => {
      const url = onUrlUpdate.mock.calls.at(-1)![0].searchParams
      expect(url.get('add')).toBeNull()
      expect(url.get('tab')).toBe('cartera')
    })

    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    view.rerenderWith(cartera)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('routes a Mercados buy to Cartera with the full prefill', async () => {
    const user = userEvent.setup()
    renderInvestments(cartera, { searchParams: '?tab=mercados' })

    await user.click(screen.getByRole('button', { name: /Registrar compra de GGAL/ }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Cartera', hidden: true })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByDisplayValue('GGAL')).toBeInTheDocument()
    expect(screen.getByDisplayValue('4850')).toBeInTheDocument()
  })
})

describe('Editar', () => {
  it('edits a holding type, keeps its bank and currency, moves no money and regroups the row', async () => {
    const user = userEvent.setup()
    holdingsMock.data = [nativeGgal]
    const view = renderInvestments(cartera, { searchParams: '?tab=cartera' })

    await user.click(within(rowOf('GGAL')).getByRole('button', { name: 'Editar' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Editar inversión' })).toBeInTheDocument()
    await user.click(within(dialog).getByLabelText('Tipo de activo'))
    await user.click(await screen.findByRole('option', { name: 'Bono' }))
    await user.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(updateMutateAsync).toHaveBeenCalledWith({
        id: 1,
        body: expect.objectContaining({ bankNumber: '017', currency: 'ARS', fundingCbu: null, assetType: 'BOND' }),
      }),
    )
    expect(createMutateAsync).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

    view.rerenderWith({
      ...cartera,
      positions: {
        ...cartera.positions!,
        data: cartera.positions!.data!.map((p) => (p.holdingId === 1 ? { ...p, assetType: 'BOND' } : p)),
      },
    } as InvestmentsBff)

    expect(screen.getAllByTestId('position-group').map((g) => g.getAttribute('data-asset-type'))).toEqual(['BOND', 'CEDEAR'])
    expect(within(groupOf('BOND')).getAllByTestId('position-row').map((r) => within(r).getByRole('link').textContent)).toEqual([
      'AL30',
      'GD30',
      'GGAL',
    ])
  })

  it('opens exactly one edit dialog for a draft set before Cartera mounts, as the position page does', async () => {
    holdingsMock.data = [nativeGgal]
    useHoldingDraftStore.getState().openEdit(1)
    renderInvestments(cartera, { searchParams: '?tab=cartera' })

    const dialog = await screen.findByRole('dialog')
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(within(dialog).getByRole('heading', { name: 'Editar inversión' })).toBeInTheDocument()
    expect(within(dialog).getByDisplayValue('GGAL')).toBeInTheDocument()
    expect(within(dialog).getByDisplayValue('12000')).toBeInTheDocument()
  })

  it('edits from the native holding even when the view currency is USD', async () => {
    const user = userEvent.setup()
    holdingsMock.data = [nativeGgal]
    const usdView = {
      ...cartera,
      positions: { status: 'OK', observedAt, data: [position(1, 'GGAL', 'STOCK', '1000', 'USD')] },
    } as InvestmentsBff
    renderInvestments(usdView, { searchParams: '?tab=cartera&currency=USD_MEP' })

    await user.click(within(rowOf('GGAL')).getByRole('button', { name: 'Editar' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByDisplayValue('12000')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() =>
      expect(updateMutateAsync).toHaveBeenCalledWith({
        id: 1,
        body: expect.objectContaining({ currency: 'ARS', avgPurchasePrice: '12000', quantity: '100', fundingCbu: null }),
      }),
    )
  })
})

describe('Cartera quantities', () => {
  it('shows the exact stored quantity instead of the rounded number', () => {
    holdingsMock.data = [{ ...nativeGgal, exactQuantity: '123456789012.123456' }]
    renderInvestments(cartera, { searchParams: '?tab=cartera' })
    expect(within(rowOf('GGAL')).getByText('123.456.789.012,123456')).toBeInTheDocument()
  })
})
