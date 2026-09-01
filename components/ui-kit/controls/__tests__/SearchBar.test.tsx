import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import React from 'react'
import esAR from '@/messages/es-AR.json'
import { SearchBar } from '../SearchBar'
import fixture from '@/lib/api/bff/__fixtures__/search.json'

vi.mock('@/lib/api/bff/search', () => ({ getSearch: vi.fn(async () => fixture) }))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="es-AR" messages={esAR}>
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  </NextIntlClientProvider>
)

describe('SearchBar', () => {
  it('focuses input on ⌘K', async () => {
    render(<SearchBar />, { wrapper })
    const input = screen.getByRole('searchbox')
    expect(input).not.toHaveFocus()
    await userEvent.keyboard('{Meta>}k{/Meta}')
    expect(input).toHaveFocus()
  })

  it('groups hits under their section headings', async () => {
    render(<SearchBar />, { wrapper })
    await userEvent.type(screen.getByRole('searchbox'), 'Coto')
    expect(await screen.findByRole('group', { name: /movimientos/i })).toBeInTheDocument()
    const hits = screen.getAllByTestId('search-hit')
    expect(hits[0]).toHaveAttribute('href', (fixture as any).movements.data[0].href)
  })

  it('announces the result count to screen readers', async () => {
    render(<SearchBar />, { wrapper })
    await userEvent.type(screen.getByRole('searchbox'), 'Coto')
    expect(await screen.findByRole('status')).toHaveTextContent(/resultado/i)
  })

  it('supports keyboard navigation with arrow keys and Escape', async () => {
    render(<SearchBar />, { wrapper })
    const input = screen.getByRole('searchbox')
    await userEvent.type(input, 'Coto')
    expect(await screen.findByRole('group', { name: /movimientos/i })).toBeInTheDocument()

    // Press ArrowDown to select first hit
    await userEvent.keyboard('{ArrowDown}')
    const hits = screen.getAllByTestId('search-hit')
    expect(hits[0]).toHaveAttribute('data-selected', 'true')

    // Press Escape to close panel
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('group', { name: /movimientos/i })).not.toBeInTheDocument()
  })
})
