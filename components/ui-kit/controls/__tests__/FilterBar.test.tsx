import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { FilterChip, FilterBar, RowActions } from '../FilterBar'

describe('FilterChip', () => {
  it('is removable by keyboard (Enter)', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<FilterChip label="ARS" onRemove={onRemove} />)
    const btn = screen.getByRole('button', { name: 'Quitar filtro ARS' })
    btn.focus()
    await user.keyboard('{Enter}')
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('is removable by keyboard (Space)', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<FilterChip label="USD" onRemove={onRemove} />)
    const btn = screen.getByRole('button', { name: 'Quitar filtro USD' })
    btn.focus()
    await user.keyboard(' ')
    expect(onRemove).toHaveBeenCalledOnce()
  })

  it('announces its removal via aria-label', () => {
    render(<FilterChip label="Efectivo" onRemove={() => {}} />)
    expect(screen.getByRole('button', { name: 'Quitar filtro Efectivo' })).toBeInTheDocument()
  })
})

describe('RowActions', () => {
  it('destructive item carries data-tone="destructive"', async () => {
    const user = userEvent.setup()
    render(
      <RowActions
        items={[
          { label: 'Editar', onSelect: vi.fn() },
          { label: 'Eliminar', onSelect: vi.fn(), tone: 'destructive' },
        ]}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Acciones de fila' }))
    const destructiveItem = screen.getByText('Eliminar')
    expect(destructiveItem).toHaveAttribute('data-tone', 'destructive')
  })
})
