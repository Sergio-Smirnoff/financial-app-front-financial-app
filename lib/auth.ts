export function getUserFromCookie(): { id: string; email: string; name: string } | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('user_info='))

  if (!match) return null

  try {
    const decoded = decodeURIComponent(match.split('=')[1])
    const [id, email, nameFull] = decoded.split('|')
    if (!id || !email || !nameFull) return null
    const name = nameFull.replace(/\+/g, ' ')
    return { id, email, name }
  } catch {
    return null
  }
}

export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='))

  if (!match) return null
  return decodeURIComponent(match.split('=')[1])
}

export function isAuthenticated(): boolean {
  return getUserFromCookie() !== null
}
