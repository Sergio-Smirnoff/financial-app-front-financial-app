import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CategoriesContent } from '../CategoriesContent'
import type { CategoriesBff, Section } from '@/lib/api/bff/types'
import React from 'react'

const NOW = new Date().toISOString()

const fixture: CategoriesBff = {
  categories: {
    status: 'OK',
    observedAt: NOW,
    data: [
      {
        id: 1,
        name: 'Comida',
        icon: 'utensils',
        color: '#ff0000',
        spendThisMonth: { amount: '45000', currency: 'ARS', secondary: null },
        budgetMonthly: { amount: '40000', currency: 'ARS', secondary: null },
      },
      {
        id: 2,
        name: 'Viajes',
        icon: 'plane',
        color: '#0000ff',
        spendThisMonth: { amount: '150', currency: 'USD', secondary: null },
        budgetMonthly: { amount: '300', currency: 'USD', secondary: null },
      },
      {
        id: 3,
        name: 'Sueldo',
        icon: 'wallet',
        color: '#00ff00',
        spendThisMonth: { amount: '450000', currency: 'ARS', secondary: null },
        budgetMonthly: null,
      },
    ],
  },
}

vi.mock('@/lib/hooks/useCategoriesPage', () => ({
  useCategoriesPage: vi.fn(),
}))

import { useCategoriesPage } from '@/lib/hooks/useCategoriesPage'

function renderCategories(data: CategoriesBff) {
  vi.mocked(useCategoriesPage).mockReturnValue({
    data,
    isLoading: false,
    refetch: vi.fn(),
  } as any)

  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <CategoriesContent />
    </QueryClientProvider>
  )
}

describe('CategoriesContent', () => {
  it('renders the four KPIs including month pace', () => {
    renderCategories(fixture)
    expect(screen.getByText('Ritmo del mes')).toBeInTheDocument()
    expect(screen.getByText('+68,00 %')).toBeInTheDocument()
  })

  it('keeps the tabs when a single section fails', () => {
    const degraded = {
      categories: { status: 'UNAVAILABLE', observedAt: NOW, data: [] } as Section<any>,
    }
    renderCategories(degraded)
    expect(screen.getByRole('tab', { name: 'Reglas' })).toBeInTheDocument()
  })

  it('renders each budget in its own currency', () => {
    renderCategories(fixture)
    const row = screen.getByText('Viajes').closest('[data-row]')!
    expect(within(row).getByText(/US\$/)).toBeInTheDocument()
  })

  it('labels an over-budget row, not just colours it', () => {
    renderCategories(fixture)
    const row = screen.getByText('Comida').closest('[data-row]')!
    expect(within(row).getByText('Excedido')).toBeInTheDocument()
    expect(within(row).getByRole('progressbar')).toHaveAttribute('data-over', 'true')
  })

  it('selects a category into the URL and shows its trend', async () => {
    const user = userEvent.setup()
    renderCategories(fixture)
    await user.click(screen.getByText('Comida'))
    expect(window.location.search).toContain('category=1')
    expect(screen.getByRole('img', { name: /Tendencia Comida/ })).toBeInTheDocument()
  })

  it('previews matches before committing a rule', async () => {
    const user = userEvent.setup()
    renderCategories(fixture)
    await user.click(screen.getByRole('tab', { name: 'Reglas' }))
    await user.click(screen.getByRole('button', { name: 'Nueva regla' }))
    await user.type(screen.getByLabelText('Coincide con'), 'UBER')
    await user.click(screen.getByRole('button', { name: 'Previsualizar' }))
    expect(await screen.findByText('12 movimientos coinciden')).toBeInTheDocument()
  })

  it('blocks committing before a preview has run', async () => {
    const user = userEvent.setup()
    renderCategories(fixture)
    await user.click(screen.getByRole('tab', { name: 'Reglas' }))
    await user.click(screen.getByRole('button', { name: 'Nueva regla' }))
    expect(screen.getByRole('button', { name: 'Crear regla' })).toBeDisabled()
  })

  it('confirms before deleting a rule', async () => {
    const user = userEvent.setup()
    renderCategories(fixture)
    await user.click(screen.getByRole('tab', { name: 'Reglas' }))
    await user.click(within(screen.getByText('UBER').closest('[data-row]')!).getByRole('button', { name: 'Acciones' }))
    expect(screen.getByRole('alertdialog')).toHaveAccessibleDescription()
  })

  it('shows income categories without budget controls', async () => {
    const user = userEvent.setup()
    renderCategories(fixture)
    await user.click(screen.getByRole('tab', { name: 'Ingresos' }))
    expect(screen.getByText('Sueldo')).toBeInTheDocument()
    expect(screen.queryByText('Presupuesto')).not.toBeInTheDocument()
  })
})
