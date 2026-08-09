'use client'

import { TopBar, type TopBarProps } from './TopBar'
import { SideNav, MobileSideNav } from './SideNav'
import { NotificationBell } from '@/components/ui-kit/notifications/NotificationBell'
import { SearchBar } from '@/components/ui-kit/controls/SearchBar'

export interface AppShellProps {
  children: React.ReactNode
  topBarProps?: Omit<TopBarProps, 'notificationSlot' | 'searchSlot'>
}

export function AppShell({ children, topBarProps }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideNav />
      <MobileSideNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          {...topBarProps}
          searchSlot={<SearchBar groups={[]} onQueryChange={() => {}} loading={false} />}
          notificationSlot={<NotificationBell />}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
