import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { OperationsTab, type OperationRow } from '../OperationsTab'
import type { Section } from '@/lib/api/bff/types'

const ok = (data: OperationRow[]): Section<OperationRow[]> => ({ status: 'OK', observedAt: '2026-09-29T10:00:00Z', data })
const amount = { amount: '1500', currency: 'ARS', secondary: null }

function renderOperations(rows: OperationRow[]) {
  render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      <OperationsTab section={ok(rows)} isLoading={false} />
    </NextIntlClientProvider>,
  )
}

describe('OperationsTab', () => {
  it('shows the phone quantity line when the quantity is known', () => {
    renderOperations([{ holdingId: 1, ticker: 'GGAL', kind: 'Compra', date: '2026-09-28', quantity: 10, amount }])
    expect(screen.getByText('10 unidades')).toBeInTheDocument()
  })

  it('omits the phone quantity line when the quantity is missing', () => {
    renderOperations([{ holdingId: 1, ticker: 'GGAL', kind: 'Compra', date: '2026-09-28', amount }])
    expect(screen.queryByText(/unidades/)).not.toBeInTheDocument()
  })
})
