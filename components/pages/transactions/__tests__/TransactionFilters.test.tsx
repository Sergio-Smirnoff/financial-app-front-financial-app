import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import { NextIntlClientProvider } from 'next-intl'
import React from 'react'
import esAR from '@/messages/es-AR.json'
import { TransactionFilters, type TransactionFilterOptions } from '../TransactionFilters'

const OPTIONS: TransactionFilterOptions = {
  accounts: [{ cbu: '0170099200000000000017', alias: 'demo.cuenta' }],
  categories: [
    { id: 1106, name: 'Supermercado' },
    { id: 1171, name: 'Supermercado / Almacén' },
  ],
  methods: ['DEBIT_CARD'],
}

function renderFilters(searchParams = '') {
  const updates: string[] = []
  render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      <QueryClientProvider client={new QueryClient()}>
        <NuqsTestingAdapter
          searchParams={searchParams}
          hasMemory
          onUrlUpdate={(event: UrlUpdateEvent) => updates.push(event.queryString)}
        >
          <TransactionFilters options={OPTIONS} />
        </NuqsTestingAdapter>
      </QueryClientProvider>
    </NextIntlClientProvider>,
  )
  return updates
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 150))

describe('TransactionFilters keeps the URL as the single source of truth', () => {
  it('keeps a deep-linked search and page untouched on mount', async () => {
    const updates = renderFilters('?q=cafe&page=3')
    await settle()
    expect(updates).toEqual([])
    expect(screen.getByRole('searchbox', { name: 'Buscar por descripción' })).toHaveValue('cafe')
  })

  it('writes the typed search and resets the page', async () => {
    const user = userEvent.setup()
    const updates = renderFilters('?page=3')
    await user.click(screen.getByRole('searchbox', { name: 'Buscar por descripción' }))
    await user.paste('Coto')
    await waitFor(() => expect(updates.at(-1)).toBe('?q=Coto'), { timeout: 3000 })
  })

  it('keeps the search when another filter changes', async () => {
    const updates = renderFilters('?q=cafe')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Filtrar por método' }), 'DEBIT_CARD')
    await waitFor(() => expect(updates.at(-1)).toBe('?q=cafe&method=DEBIT_CARD'), { timeout: 3000 })
  })

  it('stops writing the URL once nothing changes', async () => {
    const updates = renderFilters('?q=cafe')
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Filtrar por método' }), 'DEBIT_CARD')
    await settle()
    const settled = updates.length
    await settle()
    expect(updates).toHaveLength(settled)
  })
})

describe('TransactionFilters filters by several categories', () => {
  it('writes every ticked category, uncategorised included, as one comma list', async () => {
    const user = userEvent.setup()
    const updates = renderFilters()
    await user.click(screen.getByRole('button', { name: /^Filtrar por categoría:/ }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Sin categorizar' }))
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Supermercado / Almacén' }))
    await waitFor(() => expect(updates.at(-1)).toBe('?categories=none,1171'), { timeout: 3000 })
  })

  it('reads the categories from the URL, one chip each, and removes one at a time', async () => {
    const user = userEvent.setup()
    const updates = renderFilters('?categories=none,1106&page=2')
    expect(screen.getByRole('button', { name: /^Filtrar por categoría:/ })).toHaveTextContent('2 categorías')
    expect(screen.getByText('Categoría: Sin categorizar')).toBeInTheDocument()
    expect(screen.getByText('Categoría: Supermercado')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Quitar filtro Categoría: Sin categorizar' }))
    await waitFor(() => expect(updates.at(-1)).toBe('?categories=1106'), { timeout: 3000 })
  })

  it('names a single selected category on the trigger', () => {
    renderFilters('?categories=1106')
    expect(screen.getByRole('button', { name: /^Filtrar por categoría:/ })).toHaveTextContent('Supermercado')
  })

  it('keeps a category the options no longer list, named by its id and removable', async () => {
    const user = userEvent.setup()
    const updates = renderFilters('?categories=999,1106')
    expect(screen.getByText('Categoría: 999')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Quitar filtro Categoría: 999' }))
    await waitFor(() => expect(updates.at(-1)).toBe('?categories=1106'), { timeout: 3000 })
  })

  it('clears every filter at once', async () => {
    const user = userEvent.setup()
    const updates = renderFilters('?q=cafe&categories=none,1106&method=DEBIT_CARD&page=2')
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))
    await waitFor(() => expect(updates.at(-1)).toBe(''), { timeout: 3000 })
  })
})
