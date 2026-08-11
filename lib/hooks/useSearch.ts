import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { getSearch } from '@/lib/api/bff/search'
import type { SearchBff } from '@/lib/api/bff/types'

export function useSearch(q: string) {
  const [debounced, setDebounced] = useState(q)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250)
    return () => clearTimeout(t)
  }, [q])

  return useQuery<SearchBff>({
    queryKey: ['bff', 'search', debounced],
    queryFn: () => getSearch(debounced),
    enabled: debounced.trim().length >= 2,
    staleTime: 30_000,
  })
}
