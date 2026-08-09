import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountCard } from '../AccountCard'
import { CreditCardCard } from '../CreditCardCard'

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
    render(<AccountCard account={account} />)
    expect(screen.getByText('Sueldo')).toBeInTheDocument()
    expect(screen.queryByText(/Límite/)).not.toBeInTheDocument()
  })
})

describe('CreditCardCard', () => {
  it('shows limit usage and the closing cycle', () => {
    render(<CreditCardCard card={card} />)
    expect(screen.getByText(/Cierra/)).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '43')
  })
})
