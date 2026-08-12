import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import React from 'react'
import { BanksContent } from '../BanksContent'
import fixture from '@/lib/api/bff/__fixtures__/banks.json'
import type { BanksBff } from '@/lib/api/bff/types'

vi.mock('@/lib/api/bff/banks', () => ({ getBanks: vi.fn(async () => fixture as unknown as BanksBff) }))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
  </QueryClientProvider>
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
    const expected = (fixture as unknown as BanksBff).importHealth.data!.length
    expect(await screen.findAllByTestId('import-health-row')).toHaveLength(expected)
  })

  it('renders cash distribution slices from the cashDistribution section', async () => {
    render(<BanksContent />, { wrapper })
    const slices = (fixture as unknown as BanksBff).cashDistribution.data!
    expect((await screen.findAllByText(slices[0].label!))[0]).toBeInTheDocument()
  })

  it('renders the payment calendar from the paymentCalendar section', async () => {
    render(<BanksContent />, { wrapper })
    const entries = (fixture as unknown as BanksBff).paymentCalendar.data!
    expect(await screen.findByTestId('payment-calendar')).toBeInTheDocument()
    expect(await screen.findAllByTestId('payment-calendar-entry')).toHaveLength(entries.length)
  })
})
