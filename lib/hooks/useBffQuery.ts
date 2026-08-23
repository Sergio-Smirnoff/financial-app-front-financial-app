'use client'

import { useQueryStates, parseAsStringLiteral } from 'nuqs'

const CURRENCIES = ['ARS', 'USD_MEP', 'USD_CCL'] as const
const SECONDARIES = ['none', 'ARS', 'USD_MEP', 'USD_CCL'] as const

export function useBffQuery() {
  const [query] = useQueryStates({
    currency: parseAsStringLiteral(CURRENCIES).withDefault('ARS'),
    secondary: parseAsStringLiteral(SECONDARIES).withDefault('none'),
  })
  return query
}
