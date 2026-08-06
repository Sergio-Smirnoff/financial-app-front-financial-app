import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
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

describe('NotificationBell', () => {
  it('announces unread count politely via role="status"', () => {
    render(<NotificationBell />)
    const badge = screen.getByRole('status')
    expect(badge).toBeInTheDocument()
    // The mock has count=3 which is ≤9 so it renders the number
    expect(badge).toHaveTextContent('3')
  })

  it('renders the unread badge when count > 0', () => {
    render(<NotificationBell />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('opens the notification list on click', async () => {
    const user = userEvent.setup()
    render(<NotificationBell />)
    await user.click(screen.getByRole('button', { name: 'Notificaciones' }))
    expect(screen.getByTestId('notification-list')).toBeInTheDocument()
  })
})
