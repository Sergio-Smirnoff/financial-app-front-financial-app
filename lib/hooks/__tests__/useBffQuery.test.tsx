import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { useBffQuery } from '../useBffQuery'

function wrapperWith(search: string) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <NuqsTestingAdapter searchParams={search}>{children}</NuqsTestingAdapter>
  }
  return Wrapper
}

describe('useBffQuery', () => {
  it('defaults to ARS / none', () => {
    const { result } = renderHook(() => useBffQuery(), { wrapper: wrapperWith('') })
    expect(result.current).toEqual({ currency: 'ARS', secondary: 'none' })
  })

  it('reads valid values from the URL', () => {
    const { result } = renderHook(() => useBffQuery(), {
      wrapper: wrapperWith('?currency=USD_MEP&secondary=ARS'),
    })
    expect(result.current).toEqual({ currency: 'USD_MEP', secondary: 'ARS' })
  })

  it('falls back to defaults on garbage', () => {
    const { result } = renderHook(() => useBffQuery(), {
      wrapper: wrapperWith('?currency=EUR&secondary=lol'),
    })
    expect(result.current).toEqual({ currency: 'ARS', secondary: 'none' })
  })
})
