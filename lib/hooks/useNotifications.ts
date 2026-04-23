import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/lib/api/notifications'

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
    staleTime: 30_000, // 30s — skip refetch if data is still fresh
  })
}

export function useLatestNotifications(bankId?: number) {
  return useQuery({
    queryKey: ['notifications', 'latest', { bankId }],
    queryFn: () => notificationsApi.getLatest(bankId),
  })
}

export function useNotifications(page = 0, size = 20) {
  return useQuery({
    queryKey: ['notifications', 'all', { page, size }],
    queryFn: () => notificationsApi.getAll(page, size),
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: () => notificationsApi.getPreferences(),
  })
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { monthlyEmailEnabled: boolean }) => notificationsApi.updatePreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] })
    },
  })
}
