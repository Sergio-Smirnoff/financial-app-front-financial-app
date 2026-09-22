import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getTransactions } from '@/lib/api/bff/transactions'
import { api } from '@/lib/api/client'

vi.mock('@/lib/api/client', () => ({ api: { get: vi.fn(async () => ({})) } }))

describe('getTransactions', () => {
  beforeEach(() => vi.mocked(api.get).mockClear())

  it('sends plural filter params and a zero-based page', async () => {
    await getTransactions({ categories: '5', accounts: '0170001', method: 'CREDIT_CARD', q: 'super', page: 2 })
    const url = vi.mocked(api.get).mock.calls[0][0] as string
    expect(url).toContain('categories=5')
    expect(url).toContain('accounts=0170001')
    expect(url).toContain('method=CREDIT_CARD')
    expect(url).toContain('q=super')
    expect(url).toContain('page=1')
    expect(url).not.toContain('categoryId=')
    expect(url).not.toContain('accountCbu=')
  })

  it('forwards the uncategorised sentinel untouched', async () => {
    await getTransactions({ categories: 'none' })
    const url = vi.mocked(api.get).mock.calls[0][0] as string
    expect(url).toContain('categories=none')
    expect(url).toContain('page=0')
  })
})
