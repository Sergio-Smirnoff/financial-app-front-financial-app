import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import React from 'react'
import { TransactionsContent } from '../TransactionsContent'
import { TransactionDetailPanel } from '../TransactionDetailPanel'
import fixture from '@/lib/api/bff/__fixtures__/transactions.json'
import { formatPaymentMethod } from '@/lib/format'
import mockDetailFixture from '@/lib/api/bff/__fixtures__/transaction-detail.json'
import type { TransactionDetailBff, TransactionsBff } from '@/lib/api/bff/types'

vi.mock('@/lib/api/bff/transactions', () => ({
  getTransactions: vi.fn(async () => fixture as unknown as TransactionsBff),
  getTransactionDetail: vi.fn(async () => mockDetailFixture as any),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <NuqsTestingAdapter>
      {children}
    </NuqsTestingAdapter>
  </QueryClientProvider>
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
})
