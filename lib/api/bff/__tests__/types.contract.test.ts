import { describe, it, expect } from 'vitest'
import fixture from '../__fixtures__/banks.json'
import type { BanksBff } from '../types'

describe('BFF types track the gateway contract', () => {
  it('every section the gateway sends is present on the alias', () => {
    const typed: BanksBff = fixture as unknown as BanksBff
    expect(Object.keys(typed).sort()).toEqual(
      ['accounts', 'cards', 'cashDistribution', 'importHealth', 'kpis', 'loans', 'paymentCalendar'],
    )
  })

  it('a loan row carries the gateway field names', () => {
    const loan = (fixture as unknown as BanksBff).loans!.data![0]
    expect(loan).toHaveProperty('label')
    expect(loan).toHaveProperty('outstanding')
    expect(loan).toHaveProperty('installmentsTotal')
    expect(loan).not.toHaveProperty('title')
  })
})
