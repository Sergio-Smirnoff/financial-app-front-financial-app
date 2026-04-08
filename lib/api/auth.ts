import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/auth'

const BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:8080'

async function authFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })

  const json = await res.json()

  if (!res.ok || !json.success) {
    const message = json.errors?.join(', ') ?? json.message ?? 'Request failed'
    throw new Error(message)
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

  if (!res.ok || !json.success) {
    throw new Error('Refresh failed')
  }

  return json.data as AuthResponse
}
