import { describe, it, expect, vi, beforeEach } from 'vitest'
import { notFound, redirect } from 'next/navigation'
import TransactionByIdPage from '../page'

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`)
  }),
}))

const visit = (id: string) => TransactionByIdPage({ params: Promise.resolve({ id }) })

describe('/transactions/[id]', () => {
  beforeEach(() => {
    vi.mocked(notFound).mockClear()
    vi.mocked(redirect).mockClear()
  })

  it.each(['abc', '0', '-1', '1e3', '0x1A', ' 5 ', '01', '1.5', '12345678901234567'])(
    'answers not found for %j',
    async (id) => {
      await expect(visit(id)).rejects.toThrow('NEXT_NOT_FOUND')
      expect(notFound).toHaveBeenCalledOnce()
      expect(redirect).not.toHaveBeenCalled()
    },
  )

  it('redirects a positive integer id to the transactions detail panel', async () => {
    await expect(visit('12')).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/transactions?id=12')
    expect(notFound).not.toHaveBeenCalled()
  })
})
