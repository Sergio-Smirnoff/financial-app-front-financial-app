'use client'

import { Suspense } from 'react'
import { AppShell } from '@/components/ui-kit/shell/AppShell'
import { NotificationProvider } from '@/providers/NotificationProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AppShell>
        <Suspense fallback={null}>{children}</Suspense>
      </AppShell>
    </NotificationProvider>
  )
}
