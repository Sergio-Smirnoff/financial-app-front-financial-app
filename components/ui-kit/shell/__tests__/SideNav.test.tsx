import type { ReactElement } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { SideNav, MobileSideNav } from '../SideNav'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}))

const store = vi.hoisted(() => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  toggleSidebarCollapsed: vi.fn(),
  rehydrate: vi.fn(),
}))

vi.mock('@/lib/store/ui.store', () => {
  const state = () => ({
    sidebarOpen: store.sidebarOpen,
    setSidebarOpen: vi.fn(),
    toggleSidebar: vi.fn(),
    sidebarCollapsed: store.sidebarCollapsed,
    toggleSidebarCollapsed: store.toggleSidebarCollapsed,
  })
  return {
    useUiStore: Object.assign(
      (selector?: (s: ReturnType<typeof state>) => unknown) => (selector ? selector(state()) : state()),
      { persist: { rehydrate: store.rehydrate } },
    ),
  }
})

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

  it('takes a share of the screen between 176px and 240px above the md breakpoint', () => {
    const { container } = renderWithIntl(<SideNav pathname="/" />)
    const rail = container.querySelector('[data-slot="rail"]')
    expect(rail).toHaveClass('hidden', 'md:flex', 'md:w-[clamp(176px,11vw,240px)]', 'motion-reduce:transition-none')
    expect(rail).not.toHaveClass('md:w-60')
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

  it('collapses from the toggle at the bottom and restores the stored state on mount', () => {
    renderWithIntl(<SideNav pathname="/" />)
    const toggle = screen.getByRole('button', { name: 'Contraer menú' })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    fireEvent.click(toggle)
    expect(store.toggleSidebarCollapsed).toHaveBeenCalledTimes(1)
    expect(store.rehydrate).toHaveBeenCalled()
  })

  it('shrinks to a 64px icon rail that keeps every accessible name', () => {
    store.sidebarCollapsed = true
    try {
      const { container } = renderWithIntl(<SideNav pathname="/banks" />)
      const rail = container.querySelector('[data-slot="rail"]')
      expect(rail).toHaveClass('md:w-16')
      expect(rail).toHaveAttribute('data-collapsed', 'true')
      const banks = screen.getByRole('link', { name: 'Bancos' })
      expect(banks).toHaveAttribute('title', 'Bancos')
      expect(banks).toHaveAttribute('aria-current', 'page')
      expect(container.querySelector('[data-nav-label]')).toBeNull()
      const toggle = screen.getByRole('button', { name: 'Expandir menú' })
      expect(toggle).toHaveAttribute('aria-expanded', 'false')
    } finally {
      store.sidebarCollapsed = false
    }
  })

  it('shows every label when expanded, truncating only as a safety net', () => {
    const { container } = renderWithIntl(<SideNav pathname="/" />)
    const labels = [...container.querySelectorAll('[data-nav-label]')]
    expect(labels.map((l) => l.textContent)).toContain('Inversiones')
    labels.forEach((label) => expect(label).toHaveClass('truncate'))
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
