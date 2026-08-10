import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ImportsContent } from '../ImportsContent'
import type { ImportsBff } from '@/lib/api/bff/types'
import React from 'react'

const NOW = new Date().toISOString()

const fixture: ImportsBff = {
  history: {
    status: 'OK',
    observedAt: NOW,
    data: [
      {
        id: '1',
        fileName: 'resumen-junio.csv',
        source: 'CSV',
        status: 'SUCCESS',
        importedAt: NOW,
        rowCount: 142,
        duplicatesCount: 3,
      },
    ],
  },
}

vi.mock('@/lib/hooks/useImportsPage', () => ({
  useImportsPage: vi.fn(),
}))

import { useImportsPage } from '@/lib/hooks/useImportsPage'

function renderImports(data: ImportsBff) {
  vi.mocked(useImportsPage).mockReturnValue({
    data,
    isLoading: false,
    refetch: vi.fn(),
  } as any)

  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <ImportsContent />
    </QueryClientProvider>
  )
}

describe('ImportsContent', () => {
  it('shows the active run with live progress', () => {
    renderImports(fixture)
    expect(screen.getByRole('progressbar', { name: /resumen-julio\.csv/ })).toHaveAttribute('aria-valuenow', '120')
  })

  it('renders history rows with inserted, duplicate and failed counts', () => {
    renderImports(fixture)
    const row = screen.getByText('resumen-junio.csv').closest('[data-row]')!
    expect(within(row).getByText('142')).toBeInTheDocument()
    expect(within(row).getByText('3 duplicados')).toBeInTheDocument()
  })

  it('names the run, file and row count before undoing', async () => {
    const user = userEvent.setup()
    renderImports(fixture)
    await user.click(screen.getByRole('button', { name: 'Deshacer' }))
    const dialog = screen.getByRole('alertdialog')
    expect(dialog).toHaveAccessibleDescription(/resumen-junio\.csv/)
    expect(within(dialog).getByText(/142 movimientos/)).toBeInTheDocument()
  })

  it('shows matched and mismatched reconciliation with text', () => {
    renderImports(fixture)
    expect(screen.getByText('Saldo coincide')).toBeInTheDocument()
  })
})
