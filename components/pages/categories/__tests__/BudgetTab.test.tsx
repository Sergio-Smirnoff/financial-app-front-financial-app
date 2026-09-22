import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import React from 'react'
import esAR from '@/messages/es-AR.json'
import { BudgetTab } from '../BudgetTab'
import fixture from '@/lib/api/bff/__fixtures__/categories.json'
import type { CategoriesBff } from '@/lib/api/bff/types'

const budgets = (fixture as unknown as CategoriesBff).budgets

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="es-AR" messages={esAR}>
    {children}
  </NextIntlClientProvider>
)

describe('BudgetTab add-subcategory action', () => {
  it('offers the action on root rows only, never on subcategory rows', () => {
    const rowsData = budgets?.data
    if (!rowsData) throw new Error('fixture invariant: budgets present')
    const rootIndex = rowsData.findIndex((row) => row.parentId == null)
    const childIndex = rowsData.findIndex((row) => row.parentId != null)
    if (rootIndex < 0 || childIndex < 0) throw new Error('fixture invariant: a root and a subcategory row')

    render(<BudgetTab section={budgets} isLoading={false} onAddSubcategory={vi.fn()} />, { wrapper })

    const rows = screen.getAllByTestId('budget-row')
    const name = esAR.categories.budget.addSubcategory
    expect(within(rows[rootIndex]).getByRole('button', { name })).toBeInTheDocument()
    expect(within(rows[childIndex]).queryByRole('button', { name })).not.toBeInTheDocument()
  })

  it('passes the root category id to the add-subcategory handler', async () => {
    const rowsData = budgets?.data
    if (!rowsData) throw new Error('fixture invariant: budgets present')
    const root = rowsData.find((row) => row.parentId == null)
    if (!root?.categoryId) throw new Error('fixture invariant: a root row with an id')
    const onAddSubcategory = vi.fn()

    render(<BudgetTab section={budgets} isLoading={false} onAddSubcategory={onAddSubcategory} />, { wrapper })

    await userEvent.click(screen.getByRole('button', { name: esAR.categories.budget.addSubcategory }))
    expect(onAddSubcategory).toHaveBeenCalledWith(root.categoryId)
  })
})
