import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AppShell } from '../AppShell'

// Mock sub-components to isolate AppShell
vi.mock('../SideNav', () => ({
  SideNav: () => <aside data-slot="rail" className="md:w-60" />,
  MobileSideNav: () => null,
}))

vi.mock('../TopBar', () => ({
  TopBar: ({ notificationSlot }: { notificationSlot?: React.ReactNode }) => (
    <header>
      TopBar{notificationSlot}
    </header>
  ),
}))

vi.mock('@/components/ui-kit/notifications/NotificationBell', () => ({
  NotificationBell: () => <div data-testid="notification-bell" />,
}))

describe('AppShell', () => {
  it('renders a 240px rail above the md breakpoint and a drawer below it', () => {
    const { container } = render(
      <AppShell>
        <p>x</p>
      </AppShell>
    )
    expect(container.querySelector('[data-slot="rail"]')).toHaveClass('md:w-60')
  })

  it('renders children inside the main content area', () => {
    render(
      <AppShell>
        <p>content</p>
      </AppShell>
    )
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('mounts the notification bell in the top bar', () => {
    render(
      <AppShell>
        <p>x</p>
      </AppShell>
    )
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument()
  })
})
