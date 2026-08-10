import { useQuery } from '@tanstack/react-query'
import { getImports } from '@/lib/api/bff/imports'

export function useImportsPage() {
  return useQuery({
    queryKey: ['bff', 'imports'],
    queryFn: () => getImports(),
    staleTime: 30_000,
  })
}
