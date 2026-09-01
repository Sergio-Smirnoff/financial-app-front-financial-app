import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import React from 'react'
import esAR from '@/messages/es-AR.json'
import type { Section, LoanDetailRow } from '@/lib/api/bff/types'
import { LoanTable } from '../LoanTable'

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      {ui}
    </NextIntlClientProvider>,
  )
}

const galicia: LoanDetailRow = {
  id: 1,
  label: 'Personal Galicia',
  bankNumber: '0072',
  principal: { amount: '600000', currency: 'ARS', secondary: null },
  outstanding: { amount: '350000', currency: 'ARS', secondary: null },
  interestRate: 72.5,
  installmentsPaid: 6,
  installmentsTotal: 24,
  nextInstallmentDate: '2026-09-10',
  nextInstallmentAmount: { amount: '25000', currency: 'ARS', secondary: null },
  active: true,
}

// Deliberately sparse: every LoanDetailRow field is optional on the wire.
const nacion: LoanDetailRow = {
  id: 2,
  label: 'Hipotecario Nación',
  installmentsPaid: 0,
  installmentsTotal: 1,
}

function okSection(rows: LoanDetailRow[]): Section<LoanDetailRow[]> {
  return { status: 'OK', observedAt: '2026-09-01T12:00:00Z', data: rows }
}

describe('LoanTable', () => {
  it('renders the column headers in Spanish', () => {
    renderWithIntl(
      <LoanTable
        section={okSection([galicia])}
        isLoading={false}
        onViewSchedule={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByRole('columnheader', { name: 'Préstamo' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Banco' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Capital' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Saldo' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Tasa' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Próxima cuota' })).toBeInTheDocument()
  })

  it('renders one row per loan with its figures', () => {
    renderWithIntl(
      <LoanTable
        section={okSection([galicia, nacion])}
        isLoading={false}
        onViewSchedule={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Personal Galicia')).toBeInTheDocument()
    expect(screen.getByText('Hipotecario Nación')).toBeInTheDocument()
    expect(screen.getByText('0072')).toBeInTheDocument()
    expect(screen.getByText('72,50%')).toBeInTheDocument()
    expect(screen.getByText(/350\.000,00/)).toBeInTheDocument()
    expect(screen.getByText(/600\.000,00/)).toBeInTheDocument()
    expect(screen.getByText('10/09/2026')).toBeInTheDocument()
  })

  it('renders the ICU progress message, plural and singular', () => {
    renderWithIntl(
      <LoanTable
        section={okSection([galicia, nacion])}
        isLoading={false}
        onViewSchedule={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('6 de 24 cuotas')).toBeInTheDocument()
    expect(screen.getByText('0 de 1 cuota')).toBeInTheDocument()
  })

  it('renders an em-dash for absent money and rate, never an invented zero', () => {
    renderWithIntl(
      <LoanTable
        section={okSection([nacion])}
        isLoading={false}
        onViewSchedule={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    const row = screen.getByRole('row', { name: /Hipotecario Nación/ })
    // bank, principal, outstanding, rate and next-installment amount are all absent
    expect(within(row).getAllByText('—')).toHaveLength(5)
    expect(within(row).queryByText(/\$/)).not.toBeInTheDocument()
  })

  it('calls onViewSchedule with the row behind "Ver cuotas"', async () => {
    const user = userEvent.setup()
    const onViewSchedule = vi.fn()
    renderWithIntl(
      <LoanTable
        section={okSection([galicia, nacion])}
        isLoading={false}
        onViewSchedule={onViewSchedule}
        onDelete={vi.fn()}
      />,
    )

    const triggers = screen.getAllByRole('button', { name: 'Acciones de fila' })
    await user.click(triggers[0])
    await user.click(await screen.findByText('Ver cuotas'))

    expect(onViewSchedule).toHaveBeenCalledTimes(1)
    expect(onViewSchedule).toHaveBeenCalledWith(galicia)
  })

  it('calls onDelete with the row behind "Eliminar"', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    renderWithIntl(
      <LoanTable
        section={okSection([galicia, nacion])}
        isLoading={false}
        onViewSchedule={vi.fn()}
        onDelete={onDelete}
      />,
    )

    const triggers = screen.getAllByRole('button', { name: 'Acciones de fila' })
    await user.click(triggers[1])
    await user.click(await screen.findByText('Eliminar'))

    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith(nacion)
  })

  it('shows the loans-specific empty copy when the section carries no rows', () => {
    renderWithIntl(
      <LoanTable
        section={okSection([])}
        isLoading={false}
        onViewSchedule={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('Sin préstamos activos')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('degrades to the unavailable state in Spanish', () => {
    renderWithIntl(
      <LoanTable
        section={{ status: 'UNAVAILABLE', observedAt: '2026-09-01T12:00:00Z', data: null }}
        isLoading={false}
        onViewSchedule={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText('No pudimos cargar esta sección')).toBeInTheDocument()
  })
})
