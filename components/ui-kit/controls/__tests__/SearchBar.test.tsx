import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../SearchBar'
import type { SearchHit } from '../SearchBar'

const groups = [
  {
    key: 'movements',
    label: 'Movimientos',
    hits: [
      { id: '1', label: 'Supermercado Coto', href: '/transactions/1' },
      { id: '2', label: 'McDonalds', href: '/transactions/2' },
    ] as SearchHit[],
  },
]

describe('SearchBar', () => {
  it('opens on ⌘K and groups results', async () => {
    render(<SearchBar groups={groups} onQueryChange={vi.fn()} loading={false} />)
    await userEvent.keyboard('{Meta>}k{/Meta}')
    expect(screen.getByRole('dialog', { name: 'Buscar' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Movimientos' })).toBeInTheDocument()
  })

  it('debounces the query callback', async () => {
    const onQueryChange = vi.fn()
    render(<SearchBar groups={[]} onQueryChange={onQueryChange} loading={false} />)
    await userEvent.keyboard('{Meta>}k{/Meta}')
    await userEvent.type(screen.getByRole('combobox'), 'super')
    await waitFor(() => expect(onQueryChange).toHaveBeenCalledTimes(1), { timeout: 1000 })
  })
})
