import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import React from 'react'
import { TransactionsContent } from '../TransactionsContent'
import { TransactionDetailPanel } from '../TransactionDetailPanel'
import fixture from '@/lib/api/bff/__fixtures__/transactions.json'
import type { TransactionsBff } from '@/lib/api/bff/types'

vi.mock('@/lib/api/bff/transactions', () => ({
  getTransactions: vi.fn(async () => fixture as unknown as TransactionsBff),
  getTransactionDetail: vi.fn(async () => (await import('@/lib/api/bff/__fixtures__/transaction-detail.json')).default),
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
  it('renders the summary strip from the summary section', async () => {
    render(<TransactionsContent />, { wrapper })
    expect(await screen.findByTestId('tx-summary-income')).toBeInTheDocument()
    expect(screen.getByTestId('tx-summary-count')).toHaveTextContent(String(bff.summary.data!.count))
  })

  it('renders one row per page.data.rows entry', async () => {
    render(<TransactionsContent />, { wrapper })
    const rows = await screen.findAllByTestId('tx-row')
    expect(rows).toHaveLength(bff.page.data!.rows!.length)
  })

  it('offers the payment methods the gateway sent', async () => {
    render(<TransactionsContent />, { wrapper })
    for (const m of bff.filterOptions.data!.methods!) {
      expect(await screen.findByRole('option', { name: m })).toBeInTheDocument()
    }
  })

  it('shows the uncategorised banner with the section count', async () => {
    render(<TransactionsContent />, { wrapper })
    const count = bff.uncategorised.data!.count!
    if (count > 0) expect(await screen.findByRole('status')).toHaveTextContent(String(count))
  })

  it('renders origin from the detail section', async () => {
    const detail = (await import('@/lib/api/bff/__fixtures__/transaction-detail.json')).default as any
    render(<TransactionDetailPanel selectedId={detail.detail.data.transaction.id} onClose={() => {}} />, { wrapper })
    expect(await screen.findByTestId('tx-origin-file')).toHaveTextContent(detail.detail.data.origin?.fileName ?? 'Manual')
  })
})
