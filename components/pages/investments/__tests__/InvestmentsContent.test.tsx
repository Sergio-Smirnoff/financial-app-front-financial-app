import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from 'nuqs/adapters/testing'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { InvestmentsContent } from '../InvestmentsContent'
import fixture from '@/lib/api/bff/__fixtures__/investments.json'
import type { InvestmentsBff } from '@/lib/api/bff/types'
import type { Holding } from '@/types/investments'

const { holdingsMock, createMutateAsync, updateMutateAsync, deleteMutateAsync } = vi.hoisted(() => ({
  holdingsMock: { data: [] as Holding[] },
  createMutateAsync: vi.fn(async () => ({})),
  updateMutateAsync: vi.fn(async () => ({})),
  deleteMutateAsync: vi.fn(async () => undefined),
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
  useHoldings: () => ({ data: holdingsMock.data, isLoading: false }),
  useCreateHolding: () => ({ mutateAsync: createMutateAsync, isPending: false }),
  useUpdateHolding: () => ({ mutateAsync: updateMutateAsync, isPending: false }),
  useDeleteHolding: () => ({ mutateAsync: deleteMutateAsync, isPending: false }),
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
      <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
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
    expect(screen.getByTestId('inv-kpi-pnl-pct')).toHaveClass('whitespace-nowrap')
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
