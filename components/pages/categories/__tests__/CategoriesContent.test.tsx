import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { NextIntlClientProvider } from 'next-intl'
import React from 'react'
import esAR from '@/messages/es-AR.json'
import { CategoriesContent } from '../CategoriesContent'
import fixture from '@/lib/api/bff/__fixtures__/categories.json'
import type { CategoriesBff } from '@/lib/api/bff/types'

const bff: CategoriesBff = {
  ...(fixture as unknown as CategoriesBff),
  budgets: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [
      { categoryId: 1, name: 'Supermercado', cap: 100000, spent: { amount: '120000', currency: 'ARS', secondary: null }, pct: 120, alertThresholdPct: 80, over: true },
      { categoryId: 2, name: 'Servicios', cap: 50000, spent: { amount: '30000', currency: 'ARS', secondary: null }, pct: 60, alertThresholdPct: 80, over: false },
    ],
  },
  rules: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [
      { id: 10, matcher: 'COTO', categoryId: 1, categoryName: 'Supermercado', priority: 1 },
    ],
  },
}

vi.mock('@/lib/api/bff/categories', () => ({
  getCategories: vi.fn(async () => bff),
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

describe('CategoriesContent renders the real contract', () => {
  it('renders the kpi row', async () => {
    render(<CategoriesContent />, { wrapper })
    expect(await screen.findByTestId('cat-kpi-spent')).toBeInTheDocument()
    const kpis = bff.kpis
    if (!kpis?.data) throw new Error('fixture invariant: kpis present')
    expect(screen.getByTestId('cat-kpi-over-count'))
      .toHaveTextContent(String(kpis.data.overBudgetCount))
  })

  it('renders one budget row per budgets entry, flagging the over-cap one', async () => {
    render(<CategoriesContent />, { wrapper })
    const rows = await screen.findAllByTestId('budget-row')
    const budgets = bff.budgets
    if (!budgets?.data) throw new Error('fixture invariant: budgets present')
    expect(rows).toHaveLength(budgets.data.length)
    const over = budgets.data.filter((b) => b.over).length
    expect(screen.getAllByTestId('budget-over-flag')).toHaveLength(over)
  })

  it('renders the rules table from the rules section', async () => {
    const user = userEvent.setup()
    render(<CategoriesContent />, { wrapper })
    await user.click(screen.getByRole('tab', { name: 'Reglas' }))
    const rules = bff.rules
    if (!rules?.data) throw new Error('fixture invariant: rules present')
    const matcher = rules.data[0]?.matcher
    if (!matcher) throw new Error('fixture invariant: first rule has a matcher')
    expect(await screen.findByText(matcher)).toBeInTheDocument()
  })

  it('requests the trend for the selected category', async () => {
    const spy = vi.mocked((await import('@/lib/api/bff/categories')).getCategories)
    render(<CategoriesContent />, { wrapper })
    await screen.findAllByTestId('budget-row')
    await userEvent.click(screen.getAllByTestId('budget-row')[0])
    expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ categoryId: expect.anything() }))
  })
})
