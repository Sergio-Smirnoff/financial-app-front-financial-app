import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { NotificationList } from '../NotificationList'

const state = vi.hoisted(() => ({
  latest: [] as unknown[],
  paged: { content: [] as unknown[], totalPages: 0 },
  isLoading: false,
}))

vi.mock('@/lib/hooks/useNotifications', () => ({
  useUnreadCount: () => ({ data: { count: 0 } }),
  useLatestNotifications: () => ({ data: state.latest }),
  useNotifications: () => ({ data: state.paged, isLoading: state.isLoading }),
  useMarkAsRead: () => ({ mutate: vi.fn() }),
  useMarkAllAsRead: () => ({ mutate: vi.fn() }),
}))

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      {ui}
    </NextIntlClientProvider>,
  )
}

const notification = {
  id: 1,
  type: 'PAYMENT_DUE' as const,
  title: 'Vence tu tarjeta',
  message: 'El pago vence mañana',
  read: false,
  createdAt: new Date().toISOString(),
}

describe('NotificationList', () => {
  beforeEach(() => {
    state.latest = []
    state.paged = { content: [], totalPages: 0 }
    state.isLoading = false
  })

  it('titles the panel from the catalogue', () => {
    renderWithIntl(<NotificationList />)
    expect(screen.getByText('Notificaciones')).toBeInTheDocument()
  })

  it('renders the close affordance when onClose is provided', () => {
    renderWithIntl(<NotificationList onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
  })

  it('renders the mark-all affordance in full mode', () => {
    renderWithIntl(<NotificationList mode="full" />)
    expect(screen.getByRole('button', { name: 'Marcar todas' })).toBeInTheDocument()
  })

  it('renders the empty state', () => {
    renderWithIntl(<NotificationList />)
    expect(screen.getByText('No hay notificaciones')).toBeInTheDocument()
  })

  it('renders the loading state in full mode', () => {
    state.isLoading = true
    renderWithIntl(<NotificationList mode="full" />)
    expect(screen.getByText('Cargando…')).toBeInTheDocument()
  })

  it('marks an unread notification with an accessible label', () => {
    state.latest = [notification]
    renderWithIntl(<NotificationList />)
    expect(screen.getByLabelText('Sin leer')).toBeInTheDocument()
  })

  it('renders the paginator with a single-node page indicator', () => {
    state.paged = { content: [notification], totalPages: 3 }
    renderWithIntl(<NotificationList mode="full" />)
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument()
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument()
  })
})
