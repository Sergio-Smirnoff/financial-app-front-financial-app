import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/lib/api/bff/categories'
import type { BffQuery } from '@/lib/api/bff/types'

export function useCategoriesPage(query: BffQuery = {}, categoryId?: number | null) {
  const currency = query.currency ?? 'ARS'
  const secondary = query.secondary ?? 'none'

  return useQuery({
    queryKey: ['bff', 'categories', currency, secondary, categoryId],
    queryFn: () => getCategories({ currency, secondary, ...(categoryId ? { categoryId } : {}) }),
    staleTime: 30_000,
  })
}
