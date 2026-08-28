import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { NotificationBell } from '../NotificationBell'

// All tests in this file share the same module-level mock (Vitest hoisting)
vi.mock('@/lib/hooks/useNotifications', () => ({
  useUnreadCount: () => ({ data: { count: 3 } }),
  useLatestNotifications: () => ({ data: [] }),
  useMarkAsRead: () => ({ mutate: vi.fn() }),
  useMarkAllAsRead: () => ({ mutate: vi.fn() }),
  useNotifications: () => ({ data: { content: [], totalPages: 0 }, isLoading: false }),
}))

vi.mock('@/components/ui-kit/notifications/NotificationList', () => ({
  NotificationList: () => <div data-testid="notification-list" />,
}))

function renderWithIntl(ui: ReactElement) {
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      {ui}
    </NextIntlClientProvider>,
  )
}

describe('NotificationBell', () => {
  it('announces unread count politely via role="status"', () => {
    renderWithIntl(<NotificationBell />)
    const badge = screen.getByRole('status')
    expect(badge).toBeInTheDocument()
    // The mock has count=3 which is ≤9 so it renders the number
    expect(badge).toHaveTextContent('3')
  })

  it('renders the unread badge when count > 0', () => {
    renderWithIntl(<NotificationBell />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('names the unread badge with the pluralised catalogue string', () => {
    renderWithIntl(<NotificationBell />)
    expect(screen.getByRole('status')).toHaveAccessibleName('3 notificaciones sin leer')
  })

  it('opens the notification list on click', async () => {
    const user = userEvent.setup()
    renderWithIntl(<NotificationBell />)
    await user.click(screen.getByRole('button', { name: 'Notificaciones' }))
    expect(screen.getByTestId('notification-list')).toBeInTheDocument()
  })
})
