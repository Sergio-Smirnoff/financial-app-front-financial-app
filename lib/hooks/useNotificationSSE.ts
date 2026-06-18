'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { Notification } from '@/types/notifications'
import { API_CONFIG } from '@/lib/api/config'
import { getUserFromCookie } from '@/lib/auth'

const SSE_URL = `${API_CONFIG.BASE_URL}/api/v1/notifications/stream`

export function useNotificationSSE() {
  const queryClient = useQueryClient()
  const queryClientRef = useRef(queryClient)
  queryClientRef.current = queryClient

  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!getUserFromCookie()) return

    let attempt = 0
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let stopped = false
    const MAX_ATTEMPTS = 8
    const BASE_MS = 1000
    const MAX_MS = 30000

    function nextDelay() {
      const exp = Math.min(MAX_MS, BASE_MS * 2 ** attempt)
      return exp / 2 + Math.random() * (exp / 2)
    }

    function connect() {
      if (stopped || esRef.current) return

      const es = new EventSource(SSE_URL, { withCredentials: true })
      esRef.current = es

      es.onopen = () => { attempt = 0 }

      es.addEventListener('notification', (event) => {
        const notification: Notification = JSON.parse(event.data)
        toast(notification.title, { description: notification.message })
        queryClientRef.current.invalidateQueries({ queryKey: ['notifications'] })
      })

      es.onerror = () => {
        if (es.readyState !== EventSource.CLOSED) return
        es.close()
        esRef.current = null
        if (stopped || attempt >= MAX_ATTEMPTS) return
        const delay = nextDelay()
        attempt += 1
        retryTimer = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      stopped = true
      if (retryTimer) clearTimeout(retryTimer)
      esRef.current?.close()
      esRef.current = null
    }
  }, [])
}
