import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import React from 'react'
import esAR from '@/messages/es-AR.json'
import type { Section, LoansKpis } from '@/lib/api/bff/types'
import { LoanKpis } from '../LoanKpis'

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      {ui}
    </NextIntlClientProvider>,
  )
}

const fullKpis: Section<LoansKpis> = {
  status: 'OK',
  observedAt: '2026-09-01T12:00:00Z',
  data: {
    totalOutstanding: { amount: '500000', currency: 'ARS', secondary: null },
    monthlyPayment: { amount: '42000', currency: 'ARS', secondary: null },
    activeLoans: 2,
    nextDueDate: '2026-09-10',
  },
}

describe('LoanKpis', () => {
  it('labels the four tiles in Spanish', () => {
    renderWithIntl(<LoanKpis section={fullKpis} isLoading={false} />)

    expect(screen.getByText('Saldo pendiente')).toBeInTheDocument()
    expect(screen.getByText('Cuota mensual')).toBeInTheDocument()
    expect(screen.getByText('Préstamos activos')).toBeInTheDocument()
    expect(screen.getByText('Próximo vencimiento')).toBeInTheDocument()
  })

  it('formats money, the loan count and the next due date', () => {
    renderWithIntl(<LoanKpis section={fullKpis} isLoading={false} />)

    expect(screen.getByTestId('loans-kpi-outstanding')).toHaveTextContent('500.000,00')
    expect(screen.getByTestId('loans-kpi-monthly-payment')).toHaveTextContent('42.000,00')
    expect(screen.getByTestId('loans-kpi-active')).toHaveTextContent('2')
    expect(screen.getByTestId('loans-kpi-next-due')).toHaveTextContent('10/09/2026')
  })

  it('renders an em-dash for every absent figure, never an invented zero', () => {
    const sparse: Section<LoansKpis> = {
      status: 'OK',
      observedAt: '2026-09-01T12:00:00Z',
      data: {},
    }
    renderWithIntl(<LoanKpis section={sparse} isLoading={false} />)

    expect(screen.getByTestId('loans-kpi-outstanding')).toHaveTextContent('—')
    expect(screen.getByTestId('loans-kpi-monthly-payment')).toHaveTextContent('—')
    expect(screen.getByTestId('loans-kpi-active')).toHaveTextContent('—')
    expect(screen.getByTestId('loans-kpi-next-due')).toHaveTextContent('—')
    expect(screen.getByTestId('loans-kpi-active')).not.toHaveTextContent('0')
  })

  it('degrades to the unavailable state in Spanish when the section failed', () => {
    const down: Section<LoansKpis> = {
      status: 'UNAVAILABLE',
      observedAt: '2026-09-01T12:00:00Z',
      data: null,
    }
    renderWithIntl(<LoanKpis section={down} isLoading={false} />)

    expect(screen.getByText('No pudimos cargar esta sección')).toBeInTheDocument()
    expect(screen.queryByText('Saldo pendiente')).not.toBeInTheDocument()
  })
})
