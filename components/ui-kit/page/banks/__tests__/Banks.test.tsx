import type { ReactElement } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountCard } from '../AccountCard'
import { CreditCardCard } from '../CreditCardCard'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      {ui}
    </NextIntlClientProvider>,
  )
}

const account = {
  id: 'acc-1',
  name: 'Sueldo',
  bank: 'Banco Nación',
  cbu: '0110000000000000000001',
  alias: 'mi.sueldo',
  currency: 'ARS',
  balance: { amount: '150000', currency: 'ARS', secondary: null },
  lastImportAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
}

const card = {
  id: 'card-1',
  name: 'Visa Oro',
  bank: 'Santander',
  lastFour: '1234',
  currency: 'ARS',
  balance: { amount: '43000', currency: 'ARS', secondary: null },
  creditLimit: { amount: '100000', currency: 'ARS', secondary: null },
  closingDay: 15,
  dueDay: 25,
}

describe('AccountCard', () => {
  it('shows balance and import freshness, no credit fields', () => {
    renderWithIntl(<AccountCard account={account} />)
    expect(screen.getByText('Sueldo')).toBeInTheDocument()
    expect(screen.queryByText(/Límite/)).not.toBeInTheDocument()
  })
})

describe('CreditCardCard', () => {
  it('shows limit usage and the closing cycle', () => {
    renderWithIntl(<CreditCardCard card={card} />)
    expect(screen.getByText(/Cierra/)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '43')
  })

  it('labels the usage figures in Spanish', () => {
    renderWithIntl(<CreditCardCard card={card} />)
    expect(screen.getByText('Usado')).toBeInTheDocument()
    expect(screen.getByText('43 % de Límite')).toBeInTheDocument()
    expect(screen.getByText('Límite:')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: 'Uso del límite de crédito' })).toBeInTheDocument()
  })

  it('renders the closing and due days as whole sentences', () => {
    const { container } = renderWithIntl(<CreditCardCard card={card} />)
    const cycle = container.querySelectorAll('.flex.gap-4 > span')
    expect(cycle[0]).toHaveTextContent('Cierra día 15')
    expect(cycle[1]).toHaveTextContent('Vence día 25')
  })

  it('emphasises the closing and due day numbers', () => {
    renderWithIntl(<CreditCardCard card={card} />)
    expect(screen.getByText('15')).toHaveClass('font-medium', 'text-foreground')
    expect(screen.getByText('25')).toHaveClass('font-medium', 'text-foreground')
  })
})
