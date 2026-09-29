import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import { NextIntlClientProvider } from 'next-intl'
import React from 'react'
import esAR from '@/messages/es-AR.json'
import { TransactionsContent } from '../TransactionsContent'
import { TransactionDetailPanel } from '../TransactionDetailPanel'
import fixture from '@/lib/api/bff/__fixtures__/transactions.json'
import { formatPaymentMethod } from '@/lib/format'
import mockDetailFixture from '@/lib/api/bff/__fixtures__/transaction-detail.json'
import { getTransactions } from '@/lib/api/bff/transactions'
import type { TransactionDetailBff, TransactionsBff } from '@/lib/api/bff/types'

vi.mock('@/lib/api/bff/transactions', () => ({
  getTransactions: vi.fn(async () => fixture as unknown as TransactionsBff),
  getTransactionDetail: vi.fn(async () => mockDetailFixture as any),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="es-AR" messages={esAR}>
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <NuqsTestingAdapter>
        {children}
      </NuqsTestingAdapter>
    </QueryClientProvider>
  </NextIntlClientProvider>
)

const bff = fixture as unknown as TransactionsBff

describe('TransactionsContent renders the real contract', () => {
  it('renders the summary KPI strip from summary section', async () => {
    render(<TransactionsContent />, { wrapper })
    expect(await screen.findByTestId('tx-summary-income')).toBeInTheDocument()
    expect(screen.getByTestId('tx-summary-expense')).toBeInTheDocument()
    expect(screen.getByTestId('tx-summary-net')).toBeInTheDocument()
    const summary = bff.summary
    if (!summary?.data) throw new Error('fixture invariant: summary present')
    expect(screen.getByTestId('tx-summary-count')).toHaveTextContent(String(summary.data.count))
  })

  it('renders one row per page.data.rows entry', async () => {
    render(<TransactionsContent />, { wrapper })
    const rows = await screen.findAllByTestId('tx-row')
    const fixtureRows = bff.page?.data?.rows
    if (!fixtureRows) throw new Error('fixture invariant: page rows present')
    expect(rows).toHaveLength(fixtureRows.length)
  })

  it('offers the payment methods the gateway sent, labelled for the user', async () => {
    render(<TransactionsContent />, { wrapper })
    const methods = bff.filterOptions?.data?.methods
    if (!methods) throw new Error('fixture invariant: filterOptions methods present')
    for (const m of methods) {
      const option = await screen.findByRole('option', { name: formatPaymentMethod(m) })
      expect(option).toHaveValue(m)
    }
  })

  it('shows the uncategorised banner with the section count', async () => {
    render(<TransactionsContent />, { wrapper })
    const count = bff.uncategorised?.data?.count
    if (count === undefined) throw new Error('fixture invariant: uncategorised count present')
    if (count > 0) expect(await screen.findByRole('status', { name: /sin categorizar/i })).toBeInTheDocument()
  })

  it('renders origin from the detail section', async () => {
    render(<TransactionDetailPanel selectedId={80} onClose={() => {}} />, { wrapper })
    const detail = mockDetailFixture as unknown as TransactionDetailBff
    expect(await screen.findByTestId('tx-origin-file'))
      .toHaveTextContent(detail.detail?.data?.origin?.fileName ?? 'Manual')
  })

  it('renders the record transaction button', async () => {
    render(<TransactionsContent />, { wrapper })
    expect(await screen.findByRole('button', { name: /registrar movimiento/i })).toBeInTheDocument()
  })

  it('opens the detail panel for the id in the url', async () => {
    const urlWrapper = ({ children }: { children: React.ReactNode }) => (
      <NextIntlClientProvider locale="es-AR" messages={esAR}>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <NuqsTestingAdapter searchParams="?id=134">{children}</NuqsTestingAdapter>
        </QueryClientProvider>
      </NextIntlClientProvider>
    )

    render(<TransactionsContent />, { wrapper: urlWrapper })

    expect(await screen.findByRole('complementary')).toBeInTheDocument()
  })
})

describe('TransactionsContent keeps the filters in the URL', () => {
  const threePages = {
    ...bff,
    page: { ...bff.page!, data: { ...bff.page!.data!, totalPages: 3 } },
  } as TransactionsBff

  afterEach(() => {
    vi.mocked(getTransactions).mockImplementation(async () => bff)
  })

  function renderAt(searchParams: string) {
    const updates: string[] = []
    const urlWrapper = ({ children }: { children: React.ReactNode }) => (
      <NextIntlClientProvider locale="es-AR" messages={esAR}>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <NuqsTestingAdapter
            searchParams={searchParams}
            hasMemory
            onUrlUpdate={(event: UrlUpdateEvent) => updates.push(event.queryString)}
          >
            {children}
          </NuqsTestingAdapter>
        </QueryClientProvider>
      </NextIntlClientProvider>
    )
    render(<TransactionsContent />, { wrapper: urlWrapper })
    return updates
  }

  it('requests every selected category and the deep-linked search', async () => {
    renderAt('?q=cafe&categories=none,1106')
    await screen.findAllByTestId('tx-row')
    expect(getTransactions).toHaveBeenLastCalledWith(
      expect.objectContaining({ q: 'cafe', categories: 'none,1106', page: 1 }),
    )
  })

  it('keeps the category options while the next filter loads', async () => {
    const withCategories = {
      ...bff,
      filterOptions: {
        ...bff.filterOptions!,
        data: { ...bff.filterOptions!.data!, categories: [{ id: 1106, name: 'Supermercado' }, { id: 1171, name: 'Transporte' }] },
      },
    } as TransactionsBff
    let release: (value: TransactionsBff) => void = () => {}
    vi.mocked(getTransactions)
      .mockClear()
      .mockImplementationOnce(async () => withCategories)
      .mockImplementationOnce(() => new Promise<TransactionsBff>((resolve) => { release = resolve }))
    const user = userEvent.setup()
    renderAt('')
    await screen.findAllByTestId('tx-row')
    await user.click(screen.getByRole('button', { name: /^Filtrar por categoría:/ }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Supermercado' }))
    await waitFor(() => expect(getTransactions).toHaveBeenCalledTimes(2))
    expect(screen.getByRole('menuitemcheckbox', { name: 'Transporte' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: 'Filtrar por categoría: Supermercado' })).toBeInTheDocument()
    expect(screen.getAllByTestId('tx-row').length).toBeGreaterThan(0)
    release(withCategories)
  })

  it('stays on the page it moves to', async () => {
    vi.mocked(getTransactions).mockImplementation(async () => threePages)
    const updates = renderAt('?q=cafe')
    await userEvent.click(await screen.findByRole('button', { name: 'Página siguiente' }))
    await waitFor(() => expect(updates.at(-1)).toBe('?q=cafe&page=2'), { timeout: 3000 })
    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(updates.at(-1)).toBe('?q=cafe&page=2')
    expect(getTransactions).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'cafe', page: 2 }))
  })
})
