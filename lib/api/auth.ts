import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth'

import { ApiError } from './client'
import { API_CONFIG } from './config'

const BASE_URL = API_CONFIG.BASE_URL

async function authFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })

  const json = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(json?.message ?? 'Request failed', res.status, json?.code, json?.data)
  }

  return json.data as T
}

export function login(data: LoginRequest) {
  return authFetch<AuthResponse>('/api/v1/auth/login', data)
}

export function register(data: RegisterRequest) {
  return authFetch<AuthResponse>('/api/v1/auth/register', data)
}

export async function logout(): Promise<void> {
  await fetch(`${BASE_URL}/api/v1/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
}

export async function refreshToken(): Promise<AuthResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error('Refresh failed')
  }

  return json.data as AuthResponse
}
