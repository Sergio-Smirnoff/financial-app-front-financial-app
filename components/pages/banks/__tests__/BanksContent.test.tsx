import { describe, it, expect, vi, afterAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { NextIntlClientProvider } from 'next-intl'
import React from 'react'
import esAR from '@/messages/es-AR.json'
import { BanksContent } from '../BanksContent'
import fixture from '@/lib/api/bff/__fixtures__/banks.json'
import type { BanksBff } from '@/lib/api/bff/types'
import { getBanks } from '@/lib/api/bff/banks'

vi.mock('@/lib/api/bff/banks', () => ({ getBanks: vi.fn(async () => fixture as unknown as BanksBff) }))

const { createAccountMock, updateAccountMock, deleteAccountMock } = vi.hoisted(() => ({
  createAccountMock: vi.fn(),
  updateAccountMock: vi.fn(),
  deleteAccountMock: vi.fn(),
}))

vi.mock('@/lib/hooks/useBanks', () => ({
  useBanks: () => ({ banks: [], isLoading: false, isError: false, error: null }),
  useBank: () => ({ data: undefined }),
  useAvailableBanks: () => ({ data: [{ bankNumber: '007', name: 'Banco Test' }] }),
  useBankCatalog: () => ({
    data: { accountTypes: ['CHECKING', 'SAVINGS'], cardTypes: [], cardBrands: [], cardBehaviors: [] },
  }),
  useAccounts: () => ({
    createAccount: createAccountMock,
    updateAccount: updateAccountMock,
    deleteAccount: deleteAccountMock,
  }),
}))

// Radix Select drives its trigger with pointer capture, which jsdom does not implement
if (typeof window !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {}
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="es-AR" messages={esAR}>
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
    </QueryClientProvider>
  </NextIntlClientProvider>
)

describe('BanksContent renders the real contract', () => {
  it('shows the kpis section, not a summary section', async () => {
    render(<BanksContent />, { wrapper })
    expect(await screen.findByTestId('banks-kpi-total-cash')).toBeInTheDocument()
    expect(screen.getByTestId('banks-kpi-account-count')).toHaveTextContent('2')
  })

  it('renders import health from its own section, not from accounts', async () => {
    render(<BanksContent />, { wrapper })
    await screen.findByTestId('import-health-rail')
    const importHealth = (fixture as unknown as BanksBff).importHealth
    if (!importHealth?.data) throw new Error('fixture invariant: importHealth present')
    expect(await screen.findAllByTestId('import-health-row')).toHaveLength(importHealth.data.length)
  })

  it('renders cash distribution slices from the cashDistribution section', async () => {
    render(<BanksContent />, { wrapper })
    const cashDistribution = (fixture as unknown as BanksBff).cashDistribution
    if (!cashDistribution?.data) throw new Error('fixture invariant: cashDistribution present')
    const label = cashDistribution.data[0]?.label
    if (!label) throw new Error('fixture invariant: first cash slice has a label')
    expect((await screen.findAllByText(label))[0]).toBeInTheDocument()
  })

  it('renders the payment calendar from the paymentCalendar section', async () => {
    render(<BanksContent />, { wrapper })
    const paymentCalendar = (fixture as unknown as BanksBff).paymentCalendar
    if (!paymentCalendar?.data) throw new Error('fixture invariant: paymentCalendar present')
    expect(await screen.findByTestId('payment-calendar')).toBeInTheDocument()
    expect(await screen.findAllByTestId('payment-calendar-entry')).toHaveLength(paymentCalendar.data.length)
  })
})

describe('BanksContent wires the add-account dialog to the account mutations', () => {
  // Bank 007 with both BCRA modulo-10 check digits correct
  const VALID_CBU = '0070090000000000000017'

  afterAll(() => {
    vi.mocked(getBanks).mockImplementation(async () => fixture as unknown as BanksBff)
  })

  it('submits the dialog through the real createAccount mutation', async () => {
    const user = userEvent.setup()
    const base = fixture as unknown as BanksBff
    // The "Agregar cuenta" trigger lives in the accounts empty state
    vi.mocked(getBanks).mockResolvedValue({
      ...base,
      accounts: base.accounts && { ...base.accounts, data: [] },
    })

    render(<BanksContent />, { wrapper })

    await user.click(await screen.findByRole('button', { name: 'Agregar cuenta' }))

    await user.click(await screen.findByLabelText('Banco'))
    await user.click(await screen.findByRole('option', { name: '007 — Banco Test' }))
    await user.type(screen.getByLabelText('Nombre de la cuenta'), 'Sueldo')
    await user.type(screen.getByLabelText('Alias (opcional)'), 'sergi.sueldo')
    await user.type(screen.getByLabelText('CBU (22 dígitos)'), VALID_CBU)

    await user.click(screen.getByRole('button', { name: 'Crear' }))

    await waitFor(() => expect(createAccountMock).toHaveBeenCalledTimes(1))
    expect(createAccountMock).toHaveBeenCalledWith({
      bankNumber: '007',
      name: 'Sueldo',
      type: 'CHECKING',
      currency: 'USD',
      cbu: VALID_CBU,
      alias: 'sergi.sueldo',
      isActive: true,
    })
  })
})
