import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { NextIntlClientProvider } from 'next-intl'
import React from 'react'
import esAR from '@/messages/es-AR.json'
import { LoansContent } from '../LoansContent'
import { getLoans, getLoanSchedule } from '@/lib/api/bff/loans'
import type { LoansBff, LoanScheduleBff } from '@/lib/api/bff/types'

const { deleteMutateAsync, payMutateAsync } = vi.hoisted(() => ({
  deleteMutateAsync: vi.fn(async () => undefined),
  payMutateAsync: vi.fn(async () => undefined),
}))

vi.mock('@/lib/hooks/useLoans', () => ({
  useDeleteLoan: () => ({ mutateAsync: deleteMutateAsync, isPending: false }),
  usePayLoanInstallment: () => ({ mutateAsync: payMutateAsync, isPending: false }),
}))

vi.mock('@/lib/api/bff/loans', () => ({
  getLoans: vi.fn(),
  getLoanSchedule: vi.fn(),
}))

const observedAt = '2026-09-01T12:00:00Z'

const page: LoansBff = {
  kpis: {
    status: 'OK',
    observedAt,
    data: {
      totalOutstanding: { amount: '500000', currency: 'ARS', secondary: null },
      monthlyPayment: { amount: '42000', currency: 'ARS', secondary: null },
      activeLoans: 2,
      nextDueDate: '2026-09-10',
    },
  },
  loans: {
    status: 'OK',
    observedAt,
    data: [
      {
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
      },
      { id: 2, label: 'Hipotecario Nación', installmentsPaid: 0, installmentsTotal: 1 },
      // Wire anomaly: neither id nor label — every LoanDetailRow field is optional.
      { installmentsPaid: 0, installmentsTotal: 3 },
    ],
  },
  payFromAccounts: {
    status: 'OK',
    observedAt,
    data: [
      { cbu: '0170099220000012345678', alias: 'sueldo.galicia' },
      // No alias: the option falls back to the CBU.
      { cbu: '2850590940090418135201' },
    ],
  },
}

const schedule: LoanScheduleBff = {
  installments: {
    status: 'OK',
    observedAt,
    data: [
      {
        id: 11,
        number: 1,
        amount: { amount: '25000', currency: 'ARS', secondary: null },
        dueDate: '2026-07-10',
        paid: true,
        paidDate: '2026-07-09',
      },
      {
        id: 12,
        number: 2,
        amount: { amount: '25000', currency: 'ARS', secondary: null },
        dueDate: '2026-08-10',
        paid: false,
      },
    ],
  },
}

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <NuqsTestingAdapter>{children}</NuqsTestingAdapter>
      </QueryClientProvider>
    </NextIntlClientProvider>
  )
}

async function openRowMenu(user: ReturnType<typeof userEvent.setup>, index: number) {
  const triggers = await screen.findAllByRole('button', { name: 'Acciones de fila' })
  await user.click(triggers[index])
}

beforeEach(() => {
  vi.mocked(getLoans).mockReset()
  vi.mocked(getLoanSchedule).mockReset()
  deleteMutateAsync.mockClear()
  payMutateAsync.mockClear()
  vi.mocked(getLoans).mockResolvedValue(page)
  vi.mocked(getLoanSchedule).mockResolvedValue(schedule)
})

describe('LoansContent', () => {
  it('renders the heading, the KPIs and one row per loan from a single page request', async () => {
    render(<LoansContent />, { wrapper })

    expect(screen.getByRole('heading', { name: 'Préstamos', level: 1 })).toBeInTheDocument()
    expect(await screen.findByTestId('loans-kpi-outstanding')).toHaveTextContent('Saldo pendiente')
    expect(screen.getByTestId('loans-kpi-outstanding')).toHaveTextContent(/500\.000,00/)
    expect(screen.getByTestId('loans-kpi-active')).toHaveTextContent('2')
    expect(screen.getByText('Personal Galicia')).toBeInTheDocument()
    expect(screen.getByText('Hipotecario Nación')).toBeInTheDocument()
    expect(vi.mocked(getLoans)).toHaveBeenCalledTimes(1)
  })

  it('opens the schedule panel for the chosen loan and closes it again', async () => {
    const user = userEvent.setup()
    render(<LoansContent />, { wrapper })
    await screen.findByText('Personal Galicia')

    await openRowMenu(user, 0)
    await user.click(await screen.findByText('Ver cuotas'))

    const panel = await screen.findByRole('complementary', { name: 'Cronograma de cuotas' })
    expect(vi.mocked(getLoanSchedule)).toHaveBeenCalledTimes(1)
    expect(vi.mocked(getLoanSchedule)).toHaveBeenCalledWith(1, { currency: 'ARS', secondary: 'none' })
    expect(await within(panel).findByText('Pagada')).toBeInTheDocument()
    expect(within(panel).getByText('Pendiente')).toBeInTheDocument()
    expect(within(panel).getByText('10/07/2026')).toBeInTheDocument()

    await user.click(within(panel).getByRole('button', { name: 'Cerrar' }))
    expect(screen.queryByRole('complementary', { name: 'Cronograma de cuotas' })).not.toBeInTheDocument()
  })

  it('pays an unpaid installment from the chosen account and closes the dialog', async () => {
    const user = userEvent.setup()
    render(<LoansContent />, { wrapper })
    await screen.findByText('Personal Galicia')

    await openRowMenu(user, 0)
    await user.click(await screen.findByText('Ver cuotas'))
    const panel = await screen.findByRole('complementary', { name: 'Cronograma de cuotas' })

    const payButtons = await within(panel).findAllByRole('button', { name: 'Pagar cuota' })
    expect(payButtons).toHaveLength(1) // only the unpaid installment offers it
    await user.click(payButtons[0])

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Elegí la cuenta desde la que querés pagar esta cuota.')).toBeInTheDocument()
    expect(within(dialog).getByText('Cuenta de origen')).toBeInTheDocument()
    // The alias-less account falls back to its CBU.
    expect(within(dialog).getByRole('radio', { name: '2850590940090418135201' })).toBeInTheDocument()

    await user.click(within(dialog).getByRole('radio', { name: 'sueldo.galicia' }))
    await user.click(within(dialog).getByRole('button', { name: 'Confirmar pago' }))

    expect(payMutateAsync).toHaveBeenCalledTimes(1)
    expect(payMutateAsync).toHaveBeenCalledWith({
      loanId: 1,
      installmentId: 12,
      accountCbu: '0170099220000012345678',
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('never pays before an account is chosen', async () => {
    const user = userEvent.setup()
    render(<LoansContent />, { wrapper })
    await screen.findByText('Personal Galicia')

    await openRowMenu(user, 0)
    await user.click(await screen.findByText('Ver cuotas'))
    const panel = await screen.findByRole('complementary', { name: 'Cronograma de cuotas' })
    await user.click((await within(panel).findAllByRole('button', { name: 'Pagar cuota' }))[0])

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('button', { name: 'Confirmar pago' })).toBeDisabled()
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))

    expect(payMutateAsync).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('deletes a loan only through the confirm dialog', async () => {
    const user = userEvent.setup()
    render(<LoansContent />, { wrapper })
    await screen.findByText('Personal Galicia')

    await openRowMenu(user, 0)
    await user.click(await screen.findByText('Eliminar'))

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Eliminar préstamo' })).toBeInTheDocument()
    expect(
      within(dialog).getByText('¿Eliminar Personal Galicia? Esta acción no se puede deshacer.'),
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }))

    expect(deleteMutateAsync).toHaveBeenCalledTimes(1)
    expect(deleteMutateAsync).toHaveBeenCalledWith(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('cancels the delete without touching the mutation', async () => {
    const user = userEvent.setup()
    render(<LoansContent />, { wrapper })
    await screen.findByText('Personal Galicia')

    await openRowMenu(user, 1)
    await user.click(await screen.findByText('Eliminar'))

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))

    expect(deleteMutateAsync).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('guards a loan that arrived without an id or a label', async () => {
    const user = userEvent.setup()
    render(<LoansContent />, { wrapper })
    await screen.findByText('Personal Galicia')

    // No id: the schedule is never requested.
    await openRowMenu(user, 2)
    await user.click(await screen.findByText('Ver cuotas'))
    await screen.findByRole('complementary', { name: 'Cronograma de cuotas' })
    expect(vi.mocked(getLoanSchedule)).not.toHaveBeenCalled()

    // No label: the confirm copy falls back instead of interpolating "undefined",
    // and confirming without an id never reaches the mutation.
    await openRowMenu(user, 2)
    await user.click(await screen.findByText('Eliminar'))
    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByText('¿Eliminar Préstamo? Esta acción no se puede deshacer.'),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }))
    expect(deleteMutateAsync).not.toHaveBeenCalled()
  })

  it('degrades each section on its own when the page arrives unavailable', async () => {
    vi.mocked(getLoans).mockResolvedValue({
      kpis: { status: 'UNAVAILABLE', observedAt, data: null },
      loans: { status: 'OK', observedAt, data: [] },
      payFromAccounts: { status: 'UNAVAILABLE', observedAt, data: null },
    })
    render(<LoansContent />, { wrapper })

    expect(await screen.findByText('Sin préstamos activos')).toBeInTheDocument()
    expect(screen.getByText('No pudimos cargar esta sección')).toBeInTheDocument()
  })
})
