import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { TopBar } from '../TopBar'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/store/ui.store', () => ({
  useUiStore: () => ({ sidebarOpen: false, setSidebarOpen: vi.fn(), toggleSidebar: vi.fn() }),
}))

vi.mock('@/lib/auth', () => ({
  getUserFromCookie: () => null,
}))

vi.mock('@/lib/api/auth', () => ({
  logout: vi.fn(),
}))

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      {ui}
    </NextIntlClientProvider>,
  )
}

describe('TopBar', () => {
  it('names the drawer toggle from the catalogue', () => {
    renderWithIntl(<TopBar />)
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument()
  })

  it('names the logout affordance from the catalogue', () => {
    renderWithIntl(<TopBar />)
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
  })
})
