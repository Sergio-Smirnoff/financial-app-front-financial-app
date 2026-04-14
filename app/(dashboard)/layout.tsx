'use client'

import { Sidebar, MobileSidebar } from '@/components/layout/Sidebar'
import { NotificationProvider } from '@/providers/NotificationProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <MobileSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </NotificationProvider>
  )
}
