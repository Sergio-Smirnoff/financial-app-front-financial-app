'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Notification } from '@/types/notifications'
import { API_CONFIG } from '@/lib/api/config'
import { getUserFromCookie } from '@/lib/auth'

// Absolute gateway URL: EventSource must hit the gateway (:8080), not the Next.js origin.
const SSE_URL = `${API_CONFIG.BASE_URL}/api/v1/notifications/stream`

export function useNotificationSSE() {
  const queryClient = useQueryClient()
  // Stable ref so it never appears in dependency arrays
  const queryClientRef = useRef(queryClient)
  queryClientRef.current = queryClient

  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Auth is carried by the access_token cookie (withCredentials); we only need to
    // know a user is logged in. The app stores identity in the `user_info` cookie.
    if (!getUserFromCookie()) return

    function connect() {
      if (esRef.current) return

      const es = new EventSource(SSE_URL, { withCredentials: true })
      esRef.current = es

      es.addEventListener('notification', (event) => {
        const notification: Notification = JSON.parse(event.data)
        toast(notification.title, { description: notification.message })
        queryClientRef.current.invalidateQueries({ queryKey: ['notifications'] })
      })

      es.onerror = () => {
        es.close()
        esRef.current = null
        setTimeout(connect, 5000)
      }
    }

    connect()

    return () => {
      esRef.current?.close()
      esRef.current = null
    }
  }, [])
}
