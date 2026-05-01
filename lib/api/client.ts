import { getCsrfToken } from '@/lib/auth'
import { refreshToken } from '@/lib/api/auth'

const BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:8080'

// Shared in-flight promise so concurrent 401s only trigger one refresh
let refreshing: Promise<boolean> | null = null

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
  const isFormData = options?.body instanceof FormData
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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

  // On 401, try refresh once — mutex ensures only one refresh runs at a time
  if (res.status === 401) {
    try {
      if (!refreshing) {
        refreshing = refreshToken()
          .then(() => true)
          .catch(() => false)
          .finally(() => { refreshing = null })
      }
      const ok = await refreshing
      if (ok) {
        return apiFetch<T>(path, options)
      }
    } catch {
      // fall through to redirect
    }
    // Refresh failed — redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new ApiError('Session expired', 401)
  }

  const body = await res.json()

  if (!res.ok || !body.success) {
    throw new ApiError(body.message ?? 'Request failed', res.status)
  }

  return body.data as T
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, data: unknown) =>
    apiFetch<T>(path, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  put: <T>(path: string, data: unknown) =>
    apiFetch<T>(path, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
}
