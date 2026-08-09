import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable } from '../DataTable'
import { BulkActionBar } from '../BulkActionBar'
import { useState } from 'react'
import type { RowSelectionState } from '@tanstack/react-table'

type Row = { id: string; date: string; amount: number }

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
    render(<DataTable columns={cols} rows={rows} caption="Movimientos" />)
    expect(screen.getByRole('table', { name: 'Movimientos' })).toBeInTheDocument()
  })

  it('exposes sortable headers with aria-sort', async () => {
    render(<DataTable columns={cols} rows={rows} caption="Movimientos" />)
    const header = screen.getByRole('columnheader', { name: /Fecha/ })
    expect(header).toHaveAttribute('aria-sort', 'none')
    await userEvent.click(within(header).getByRole('button'))
    expect(header).toHaveAttribute('aria-sort', 'ascending')
  })

  it('th elements have scope="col"', () => {
    const { container } = render(<DataTable columns={cols} rows={rows} caption="Movimientos" />)
    const headers = container.querySelectorAll('th')
    headers.forEach((th) => {
      expect(th).toHaveAttribute('scope', 'col')
    })
  })

  it('announces the selected count', async () => {
    render(<TableHarness />)
    await userEvent.click(screen.getAllByRole('checkbox')[1])
    expect(screen.getByRole('status')).toHaveTextContent('1 seleccionado')
  })
})
