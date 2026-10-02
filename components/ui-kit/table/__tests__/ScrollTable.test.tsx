import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ScrollTable } from '../ScrollTable'

const columns = [
  { id: 'name', accessorKey: 'name', header: 'Nombre' },
  { id: 'date', accessorKey: 'date', header: 'Fecha' },
]
const rows = [{ id: 1, name: 'Coto', date: '2026-08-01' }]

describe('ScrollTable', () => {
  it('caps its height through a CSS variable a caller can lift', () => {
    render(<ScrollTable columns={columns} rows={rows} caption="Movimientos" maxHeight={320} className="frame:max-h-none" />)
    const scroller = screen.getByRole('table', { name: 'Movimientos' }).parentElement!
    expect(scroller).toHaveClass('max-h-[var(--scroll-table-max)]', 'frame:max-h-none')
    expect(scroller.style.getPropertyValue('--scroll-table-max')).toBe('320px')
  })

  it('keeps the 400px default cap', () => {
    render(<ScrollTable columns={columns} rows={rows} caption="Movimientos" />)
    const scroller = screen.getByRole('table', { name: 'Movimientos' }).parentElement!
    expect(scroller.style.getPropertyValue('--scroll-table-max')).toBe('400px')
  })

  it('puts a column class on that column header and every cell', () => {
    render(<ScrollTable columns={columns} rows={rows} caption="Movimientos" columnClassNames={{ date: 'max-md:hidden' }} />)
    expect(screen.getByRole('columnheader', { name: 'Fecha' })).toHaveClass('max-md:hidden')
    expect(screen.getByRole('cell', { name: '2026-08-01' })).toHaveClass('max-md:hidden')
    expect(screen.getByRole('cell', { name: 'Coto' })).not.toHaveClass('max-md:hidden')
  })
})
