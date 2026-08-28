import type { ReactElement } from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { FreshnessStamp } from '../FreshnessStamp'
import { FeeTable } from '../FeeTable'

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      {ui}
    </NextIntlClientProvider>,
  )
}

function minutesAgo(n: number): string {
  return new Date(Date.now() - n * 60 * 1000).toISOString()
}

function ars(amount: string) {
  return { amount, currency: 'ARS', secondary: null }
}

describe('FreshnessStamp', () => {
  it('reads the age in es-AR and marks staleness', () => {
    render(<FreshnessStamp observedAt={minutesAgo(75)} />)
    // date-fns es locale renders "hace alrededor de 1 hora"
    expect(screen.getByText(/hace.*1 hora/)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('data-stale', 'true')
  })

  it('does not mark fresh data as stale', () => {
    render(<FreshnessStamp observedAt={minutesAgo(30)} />)
    expect(screen.getByRole('status')).not.toHaveAttribute('data-stale', 'true')
  })
})

describe('FeeTable', () => {
  it('renders IVA treatment per fee row', () => {
    renderWithIntl(
      <FeeTable
        rows={[
          {
            scope: 'Cuenta',
            label: 'Mantenimiento',
            amount: ars('3500'),
            pct: null,
            ivaTreatment: 'TAXED_21',
          },
        ]}
      />
    )
    expect(screen.getByText('IVA 21 %')).toBeInTheDocument()
  })

  it('renders fee rows inside a scroll table', () => {
    renderWithIntl(
      <FeeTable
        rows={[
          {
            scope: 'Cuenta',
            label: 'Retiro',
            amount: null,
            pct: 0.5,
            ivaTreatment: 'EXEMPT',
          },
        ]}
      />
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
  })

  it('labels its caption and column headers in Spanish', () => {
    renderWithIntl(
      <FeeTable
        rows={[
          {
            scope: 'Cuenta',
            label: 'Retiro',
            amount: null,
            pct: 0.5,
            ivaTreatment: 'EXEMPT',
          },
        ]}
      />
    )
    expect(screen.getByRole('table', { name: 'Tabla de comisiones' })).toBeInTheDocument()
    for (const header of ['Categoría', 'Concepto', 'Importe', 'IVA']) {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument()
    }
    expect(screen.getByText('Exento')).toBeInTheDocument()
  })
})
