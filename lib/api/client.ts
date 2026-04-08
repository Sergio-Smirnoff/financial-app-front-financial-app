import { getCsrfToken } from '@/lib/auth'
import { refreshToken } from '@/lib/api/auth'

const BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:8080'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options?.headers as Record<string, string>) ?? {}),
  }

  // Add CSRF token for state-changing methods
  const method = options?.method?.toUpperCase() ?? 'GET'
  if (method !== 'GET' && method !== 'HEAD') {
    const csrf = getCsrfToken()
    if (csrf) {
      headers['X-XSRF-TOKEN'] = csrf
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  // On 401, try refresh and retry once
  if (res.status === 401) {
    try {
      await refreshToken()
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: 'include',
      })
      const retryBody = await retryRes.json()
      if (!retryRes.ok || !retryBody.success) {
        throw new ApiError(retryBody.message ?? 'Request failed', retryRes.status)
      }
      return retryBody.data as T
    } catch {
      // Refresh failed — redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new ApiError('Session expired', 401)
    }
  }

  const body = await res.json()

  if (!res.ok || !body.success) {
    throw new ApiError(body.message ?? 'Request failed', res.status)
  }

  return body.data as T
}

export const api = {
  get:    <T>(path: string)                  => apiFetch<T>(path),
  post:   <T>(path: string, data: unknown)   => apiFetch<T>(path, { method: 'POST',   body: JSON.stringify(data) }),
  put:    <T>(path: string, data: unknown)   => apiFetch<T>(path, { method: 'PUT',    body: JSON.stringify(data) }),
  delete: <T>(path: string)                  => apiFetch<T>(path, { method: 'DELETE' }),
}
