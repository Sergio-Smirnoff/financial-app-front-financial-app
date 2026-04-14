'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Notification } from '@/types/notifications'

const SSE_URL = '/api/v1/notifications/stream'

export function useNotificationSSE() {
  const queryClient = useQueryClient()
  // Stable ref so it never appears in dependency arrays
  const queryClientRef = useRef(queryClient)
  queryClientRef.current = queryClient

  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    const userId = getUserIdFromCookie()
    if (!userId) return

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

function getUserIdFromCookie(): number | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)userId=([^;]+)/)
  return match ? parseInt(match[1], 10) : null
}
