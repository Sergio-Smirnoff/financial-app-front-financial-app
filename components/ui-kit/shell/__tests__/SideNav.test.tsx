import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SideNav } from '../SideNav'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      overview: 'Resumen',
      banks: 'Bancos',
      transactions: 'Movimientos',
      categories: 'Categorías',
      investments: 'Inversiones',
      imports: 'Importaciones',
      settings: 'Ajustes',
    }
    return map[key] ?? key
  },
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}))

// Mock ui store
vi.mock('@/lib/store/ui.store', () => ({
  useUiStore: () => ({ sidebarOpen: false, setSidebarOpen: vi.fn(), toggleSidebar: vi.fn() }),
}))

describe('SideNav', () => {
  it('marks the current route with aria-current', () => {
    render(<SideNav pathname="/banks" />)
    expect(screen.getByRole('link', { name: 'Bancos' })).toHaveAttribute('aria-current', 'page')
  })

  it('does not mark other routes with aria-current', () => {
    render(<SideNav pathname="/banks" />)
    expect(screen.getByRole('link', { name: 'Resumen' })).not.toHaveAttribute('aria-current')
  })

  it('renders the 240px rail slot above md breakpoint', () => {
    const { container } = render(<SideNav pathname="/" />)
    const rail = container.querySelector('[data-slot="rail"]')
    expect(rail).not.toBeNull()
    expect(rail).toHaveClass('md:w-60')
  })

  it('renders all nav items', () => {
    render(<SideNav pathname="/" />)
    expect(screen.getByRole('link', { name: 'Resumen' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Bancos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Inversiones' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ajustes' })).toBeInTheDocument()
  })
})
