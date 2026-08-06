'use client'

import { TopBar, type TopBarProps } from './TopBar'
import { SideNav, MobileSideNav } from './SideNav'
import { NotificationBell } from '@/components/ui-kit/notifications/NotificationBell'

export interface AppShellProps {
  children: React.ReactNode
  topBarProps?: Omit<TopBarProps, 'notificationSlot'>
}

export function AppShell({ children, topBarProps }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideNav />
      <MobileSideNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          {...topBarProps}
          notificationSlot={<NotificationBell />}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
