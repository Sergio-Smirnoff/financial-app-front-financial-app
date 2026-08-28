import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { SideNav, MobileSideNav } from '../SideNav'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}))

const store = vi.hoisted(() => ({ sidebarOpen: false }))

// Mock ui store
vi.mock('@/lib/store/ui.store', () => ({
  useUiStore: () => ({
    sidebarOpen: store.sidebarOpen,
    setSidebarOpen: vi.fn(),
    toggleSidebar: vi.fn(),
  }),
}))

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      {ui}
    </NextIntlClientProvider>,
  )
}

describe('SideNav', () => {
  it('marks the current route with aria-current', () => {
    renderWithIntl(<SideNav pathname="/banks" />)
    expect(screen.getByRole('link', { name: 'Bancos' })).toHaveAttribute('aria-current', 'page')
  })

  it('does not mark other routes with aria-current', () => {
    renderWithIntl(<SideNav pathname="/banks" />)
    expect(screen.getByRole('link', { name: 'Resumen' })).not.toHaveAttribute('aria-current')
  })

  it('renders the 240px rail slot above md breakpoint', () => {
    const { container } = renderWithIntl(<SideNav pathname="/" />)
    const rail = container.querySelector('[data-slot="rail"]')
    expect(rail).not.toBeNull()
    expect(rail).toHaveClass('md:w-60')
  })

  it('renders all nav items', () => {
    renderWithIntl(<SideNav pathname="/" />)
    expect(screen.getByRole('link', { name: 'Resumen' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Bancos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inversiones' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ajustes' })).toBeInTheDocument()
  })

  it('names the rail navigation landmark from the catalogue', () => {
    renderWithIntl(<SideNav pathname="/" />)
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
  })
})

describe('MobileSideNav', () => {
  it('names the drawer landmark and its close affordance from the catalogue', () => {
    store.sidebarOpen = true
    try {
      renderWithIntl(<MobileSideNav pathname="/" />)
      expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cerrar menú' })).toBeInTheDocument()
    } finally {
      store.sidebarOpen = false
    }
  })
})
