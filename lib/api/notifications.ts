import { api } from './client'
import type { Notification, NotificationPreference, UnreadCount } from '@/types/notifications'

interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const notificationsApi = {
  getAll: (page = 0, size = 20): Promise<PaginatedResponse<Notification>> =>
    api.get(`/api/v1/notifications?page=${page}&size=${size}`),

  getLatest: (bankId?: number): Promise<Notification[]> =>
    api.get(bankId ? `/api/v1/notifications/latest?bankId=${bankId}` : '/api/v1/notifications/latest'),

  getUnreadCount: (): Promise<UnreadCount> =>
    api.get('/api/v1/notifications/unread-count'),

  markAsRead: (id: number): Promise<void> =>
    api.put<void>(`/api/v1/notifications/${id}/read`, null),

  markAllAsRead: (): Promise<void> =>
    api.put<void>('/api/v1/notifications/read-all', null),

  getPreferences: (): Promise<NotificationPreference> =>
    api.get('/api/v1/notifications/preferences'),

  updatePreferences: (data: { monthlyEmailEnabled: boolean }): Promise<NotificationPreference> =>
    api.put('/api/v1/notifications/preferences', data),
}
