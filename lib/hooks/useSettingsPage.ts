import { useQuery } from '@tanstack/react-query'
import { getSettings } from '@/lib/api/bff/settings'

export function useSettingsPage() {
  return useQuery({
    queryKey: ['bff', 'settings'],
    queryFn: () => getSettings(),
    staleTime: 30_000,
  })
}
