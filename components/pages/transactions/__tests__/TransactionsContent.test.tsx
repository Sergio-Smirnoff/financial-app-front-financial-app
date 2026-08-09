import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TransactionsContent } from '../TransactionsContent'
import type { TransactionsBff, Section } from '@/lib/api/bff/types'
import React from 'react'

const NOW = new Date().toISOString()

const fixture: TransactionsBff = {
  filters: {
    status: 'OK',
    observedAt: NOW,
    data: {
      categories: [{ id: 3, name: 'Comida' }],
      accounts: [{ cbu: '0170001', alias: 'galicia.ars' }],
    },
  },
  movements: {
    status: 'OK',
    observedAt: NOW,
    data: {
      items: [
        {
          id: 1,
          date: '2026-08-01',
          description: 'Supermercado Coto',
          accountCbu: '0170001',
          accountAlias: 'galicia.ars',
          categoryId: null,
          categoryName: null,
          method: 'Débito automático',
          note: null,
          amount: { amount: '25000', currency: 'ARS', secondary: null },
          direction: 'OUT',
        },
      ],
      page: 1,
      totalPages: 1,
      totalCount: 1,
    },
  },
}

const detailFixture = {
  id: 1,
  description: 'Supermercado Coto',
  amount: { amount: '25000', currency: 'ARS', secondary: null },
  direction: 'OUT',
  accountAlias: 'galicia.ars',
  categoryName: null,
  method: 'Débito automático',
  note: 'Compra semanal',
  origin: 'resumen-julio.csv',
  reconciled: true,
}

vi.mock('@/lib/hooks/useTransactionsPage', () => ({
  useTransactionsPage: vi.fn(),
}))

vi.mock('@/lib/hooks/useTransactionDetail', () => ({
  useTransactionDetail: vi.fn(),
}))

import { useTransactionsPage } from '@/lib/hooks/useTransactionsPage'
import { useTransactionDetail } from '@/lib/hooks/useTransactionDetail'

function renderTransactions(data: TransactionsBff, options?: { detail?: any }) {
  vi.mocked(useTransactionsPage).mockReturnValue({
    data,
    isLoading: false,
    refetch: vi.fn(),
  } as any)

  vi.mocked(useTransactionDetail).mockReturnValue({
    data: options?.detail ?? detailFixture,
    isLoading: false,
  } as any)

  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <TransactionsContent />
    </QueryClientProvider>
  )
}

describe('TransactionsContent', () => {
  it('renders the Método column from the row payload', () => {
    renderTransactions(fixture)
    expect(screen.getByRole('columnheader', { name: 'Método' })).toBeInTheDocument()
    expect(screen.getByText('Débito automático')).toBeInTheDocument()
  })

  it('signs every amount with a glyph', () => {
    renderTransactions(fixture)
    expect(screen.getAllByText(/^[+−-]/).length).toBeGreaterThan(0)
  })

  it('announces the uncategorised count and links to a filtered view', () => {
    renderTransactions(fixture)
    const banner = screen.getByRole('status', { name: /sin categorizar/i })
    expect(within(banner).getByRole('link')).toHaveAttribute('href', '/transactions?categories=none')
  })

  it('shows origin and reconciliation state for an imported movement', async () => {
    const user = userEvent.setup()
    renderTransactions(fixture)
    await user.click(screen.getByText('Supermercado Coto'))
    expect(await screen.findByText('resumen-julio.csv')).toBeInTheDocument()
    expect(screen.getByText('Conciliado')).toBeInTheDocument()
  })

  it('says Manual when the movement has no import run', async () => {
    const user = userEvent.setup()
    renderTransactions(fixture, { detail: { ...detailFixture, origin: null } })
    await user.click(screen.getByText('Supermercado Coto'))
    expect(await screen.findByText('Manual')).toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the row', async () => {
    const user = userEvent.setup()
    renderTransactions(fixture)
    await user.click(screen.getByText('Supermercado Coto'))
    await user.keyboard('{Escape}')
    expect(screen.queryByText('resumen-julio.csv')).not.toBeInTheDocument()
  })
})
