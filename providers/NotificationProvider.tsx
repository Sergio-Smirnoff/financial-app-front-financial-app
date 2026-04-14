'use client'

import { useNotificationSSE } from '@/lib/hooks/useNotificationSSE'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  useNotificationSSE()
  return <>{children}</>
}
