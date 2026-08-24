import type { ReactElement } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { DataTable } from '../DataTable'
import { BulkActionBar } from '../BulkActionBar'
import { Pagination } from '../Pagination'
import { useState } from 'react'
import type { RowSelectionState } from '@tanstack/react-table'

type Row = { id: string; date: string; amount: number }

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      {ui}
    </NextIntlClientProvider>,
  )
}

const cols = [
  { id: 'date', accessorKey: 'date', header: 'Fecha', enableSorting: true },
  { id: 'amount', accessorKey: 'amount', header: 'Monto', enableSorting: false },
]

const rows: Row[] = [
  { id: '1', date: '2024-01-01', amount: 100 },
  { id: '2', date: '2024-01-02', amount: 200 },
]

function TableHarness() {
  const [selection, setSelection] = useState<RowSelectionState>({})
  return (
    <>
      <DataTable
        columns={cols}
        rows={rows}
        caption="Movimientos"
        selection={selection}
        onSelectionChange={setSelection}
      />
      <BulkActionBar
        count={Object.keys(selection).length}
        actions={[{ label: 'Eliminar', onSelect: vi.fn() }]}
        onClear={() => setSelection({})}
      />
    </>
  )
}

describe('DataTable', () => {
  it('renders a caption for screen readers', () => {
    renderWithIntl(<DataTable columns={cols} rows={rows} caption="Movimientos" />)
    expect(screen.getByRole('table', { name: 'Movimientos' })).toBeInTheDocument()
  })

  it('exposes sortable headers with aria-sort', async () => {
    renderWithIntl(<DataTable columns={cols} rows={rows} caption="Movimientos" />)
    const header = screen.getByRole('columnheader', { name: /Fecha/ })
    expect(header).toHaveAttribute('aria-sort', 'none')
    await userEvent.click(within(header).getByRole('button'))
    expect(header).toHaveAttribute('aria-sort', 'ascending')
  })

  it('th elements have scope="col"', () => {
    const { container } = renderWithIntl(
      <DataTable columns={cols} rows={rows} caption="Movimientos" />
    )
    const headers = container.querySelectorAll('th')
    headers.forEach((th) => {
      expect(th).toHaveAttribute('scope', 'col')
    })
  })

  it('names its selection checkboxes in Spanish', () => {
    renderWithIntl(<TableHarness />)
    expect(
      screen.getByRole('checkbox', { name: 'Seleccionar todas las filas' })
    ).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Seleccionar fila 1' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Seleccionar fila 2' })).toBeInTheDocument()
  })

  it('announces the selected count', async () => {
    renderWithIntl(<TableHarness />)
    await userEvent.click(screen.getAllByRole('checkbox')[1])
    expect(screen.getByRole('status')).toHaveTextContent('1 seleccionado')
  })
})

describe('BulkActionBar', () => {
  it('announces an empty selection to screen readers', () => {
    renderWithIntl(<BulkActionBar count={0} actions={[]} onClear={vi.fn()} />)
    expect(screen.getByRole('status')).toHaveTextContent('Sin filas seleccionadas')
  })

  it('pluralises the selected count', () => {
    renderWithIntl(<BulkActionBar count={3} actions={[]} onClear={vi.fn()} />)
    expect(screen.getByRole('status')).toHaveTextContent('3 seleccionados')
  })

  it('names its clear-selection button in Spanish', () => {
    renderWithIntl(<BulkActionBar count={2} actions={[]} onClear={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Limpiar selección' })).toBeInTheDocument()
  })
})

describe('Pagination', () => {
  it('labels the nav and its controls in Spanish', () => {
    renderWithIntl(<Pagination page={2} totalPages={5} onChange={vi.fn()} />)
    expect(screen.getByRole('navigation', { name: 'Paginación' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página anterior' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Página siguiente' })).toBeInTheDocument()
  })

  it('reads the current page out of the total', () => {
    renderWithIntl(<Pagination page={2} totalPages={5} onChange={vi.fn()} />)
    expect(screen.getByText('Página 2 de 5')).toBeInTheDocument()
  })
})
