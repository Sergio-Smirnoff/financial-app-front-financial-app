const BASE_URL = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'http://localhost:8080'
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID ?? '1'

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
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': DEV_USER_ID,
      ...options?.headers,
    },
  })

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
