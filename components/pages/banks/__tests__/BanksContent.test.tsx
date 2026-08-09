import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BanksContent } from '../BanksContent'
import { AddAccountDialog } from '../AddAccountDialog'
import { CardFormDialog } from '../CardFormDialog'
import type { BanksBff, Section } from '@/lib/api/bff/types'
import React from 'react'

const NOW = new Date().toISOString()
const STALE_DATE = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()

const fixture: BanksBff = {
  summary: {
    status: 'OK',
    observedAt: NOW,
    data: {
      totalBalance: { amount: '1200000', currency: 'ARS', secondary: null },
      activeAccounts: 2,
      activeCards: 1,
      totalLoans: { amount: '350000', currency: 'ARS', secondary: null },
    },
  },
  accounts: {
    status: 'OK',
    observedAt: NOW,
    data: [
      { id: 1, bankName: 'Galicia', accountType: 'Caja de Ahorro', cbu: '0070001', alias: 'galicia.ars', balance: { amount: '800000', currency: 'ARS', secondary: null }, lastSync: NOW },
      { id: 2, bankName: 'BBVA', accountType: 'Cuenta Corriente', cbu: '0170002', alias: 'bbva.ars', balance: { amount: '400000', currency: 'ARS', secondary: null }, lastSync: STALE_DATE },
    ],
  },
  cards: {
    status: 'OK',
    observedAt: NOW,
    data: [
      { id: 1, cardName: 'Visa Signature', lastFour: '4321', dueDate: '2026-08-28', closingDate: '2026-08-20', balance: { amount: '180000', currency: 'ARS', secondary: null } },
    ],
  },
  loans: {
    status: 'OK',
    observedAt: NOW,
    data: [
      { id: 1, title: 'Préstamo Personal', lender: 'Galicia', totalAmount: { amount: '500000', currency: 'ARS', secondary: null }, remainingAmount: { amount: '350000', currency: 'ARS', secondary: null }, installmentAmount: { amount: '35000', currency: 'ARS', secondary: null }, installmentsLeft: 10, nextDueDate: '2026-09-05' },
    ],
  },
}

vi.mock('@/lib/hooks/useBanksPage', () => ({
  useBanksPage: vi.fn(),
}))

import { useBanksPage } from '@/lib/hooks/useBanksPage'

function renderBanks(data: BanksBff) {
  vi.mocked(useBanksPage).mockReturnValue({
    data,
    isLoading: false,
    refetch: vi.fn(),
  } as any)

  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <BanksContent />
    </QueryClientProvider>
  )
}

describe('BanksContent', () => {
  it('reflects the active tab in the URL', async () => {
    const user = userEvent.setup()
    renderBanks(fixture)
    await user.click(screen.getByRole('tab', { name: 'Tarjetas' }))
    expect(window.location.search).toContain('tab=cards')
  })

  it('shows limit usage on a card and never on an account', () => {
    renderBanks(fixture)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('keeps sibling sections alive when accounts fail', () => {
    const degraded = {
      ...fixture,
      accounts: { status: 'UNAVAILABLE', observedAt: NOW, data: [] } as Section<any>,
    }
    renderBanks(degraded)
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    expect(screen.getByText('Estado de Importaciones')).toBeInTheDocument()
  })

  it('summarises loans and links to the full route', async () => {
    const user = userEvent.setup()
    renderBanks(fixture)
    await user.click(screen.getByRole('tab', { name: 'Préstamos' }))
    const link = screen.getByRole('link', { name: /Ver todo/ })
    expect(link).toHaveAttribute('href', '/loans')
  })

  it('labels a never-imported account as such', () => {
    const noSync = {
      ...fixture,
      accounts: {
        status: 'OK',
        observedAt: NOW,
        data: [{ id: 1, bankName: 'Naranja X', accountType: 'Digital', cbu: '0001', alias: 'nx.ars', balance: { amount: '0', currency: 'ARS', secondary: null }, lastSync: '' }],
      } as Section<any>,
    }
    renderBanks(noSync)
    expect(screen.getAllByText('Sin importaciones').length).toBeGreaterThan(0)
  })

  it('every banks dialog has an accessible description', () => {
    const queryClient = new QueryClient()

    const { unmount: u1 } = render(
      <QueryClientProvider client={queryClient}>
        <AddAccountDialog open={true} onOpenChange={() => {}} />
      </QueryClientProvider>
    )
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription()
    u1()

    const { unmount: u2 } = render(
      <QueryClientProvider client={queryClient}>
        <CardFormDialog open={true} onOpenChange={() => {}} />
      </QueryClientProvider>
    )
    expect(screen.getByRole('dialog')).toHaveAccessibleDescription()
    u2()
  })
})
