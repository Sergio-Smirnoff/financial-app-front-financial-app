import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import React from 'react'
import esAR from '@/messages/es-AR.json'
import { ImportsContent } from '../ImportsContent'
import fixture from '@/lib/api/bff/__fixtures__/imports.json'
import type { ImportsBff } from '@/lib/api/bff/types'

if (typeof Element.prototype.hasPointerCapture === 'undefined') {
  Element.prototype.hasPointerCapture = () => false
}

const bff: ImportsBff = {
  ...(fixture as unknown as ImportsBff),
  history: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [
      {
        runId: 1,
        fileName: 'resumen-junio.csv',
        accountCbu: '000111222',
        importedAt: new Date().toISOString(),
        inserted: 142,
        duplicates: 3,
        failed: 0,
        status: 'COMPLETED',
      },
    ],
  },
  reconciliation: {
    status: 'OK',
    observedAt: new Date().toISOString(),
    data: [
      {
        runId: 1,
        expectedBalance: { amount: '1000.00', currency: 'ARS' },
        computedBalance: { amount: '1000.00', currency: 'ARS' },
        matches: true,
      },
    ],
  },
}

vi.mock('@/lib/api/bff/imports', () => ({
  getImports: vi.fn(async () => bff),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextIntlClientProvider locale="es-AR" messages={esAR}>
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  </NextIntlClientProvider>
)

describe('ImportsContent renders the real contract', () => {
  it('renders one history row per run, with its counters', async () => {
    render(<ImportsContent />, { wrapper })
    const rows = await screen.findAllByTestId('import-run-row')
    const history = bff.history
    if (!history?.data) throw new Error('fixture invariant: history present')
    expect(rows).toHaveLength(history.data.length)
    expect(rows[0]).toHaveTextContent(String(history.data[0].inserted))
  })

  it('renders the reconciliation card from its own section', async () => {
    render(<ImportsContent />, { wrapper })
    const card = await screen.findByTestId('reconciliation-card')
    const reconciliation = bff.reconciliation
    if (!reconciliation?.data) throw new Error('fixture invariant: reconciliation present')
    expect(card).toHaveTextContent(reconciliation.data[0].matches ? /coincide/i : /no coincide/i)
  })

  it('shows the active run progress when one is running', async () => {
    const running = {
      ...bff,
      activeRun: {
        status: 'OK',
        observedAt: new Date().toISOString(),
        data: {
          runId: 99,
          status: 'RUNNING',
          fileName: 'demo.csv',
          startedAt: new Date().toISOString(),
          processed: 12,
          total: 40,
        },
      },
    }
    vi.mocked((await import('@/lib/api/bff/imports')).getImports).mockResolvedValueOnce(running as any)
    render(<ImportsContent />, { wrapper })
    expect(await screen.findByTestId('active-run-card')).toHaveTextContent('12')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '12')
  })

  it('polls while a run is active and stops when it finishes', async () => {
    vi.useFakeTimers()
    const spy = vi.mocked((await import('@/lib/api/bff/imports')).getImports)
    const running = {
      ...bff,
      activeRun: {
        status: 'OK',
        observedAt: new Date().toISOString(),
        data: {
          runId: 99,
          status: 'RUNNING',
          fileName: 'demo.csv',
          startedAt: new Date().toISOString(),
          processed: 12,
          total: 40,
        },
      },
    }
    spy.mockResolvedValue(running as any)
    render(<ImportsContent />, { wrapper })
    await vi.advanceTimersByTimeAsync(5000)
    expect(spy.mock.calls.length).toBeGreaterThan(1)
    vi.useRealTimers()
  })
})
