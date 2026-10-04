'use client'

import { Suspense } from 'react'
import { AppShell } from '@/components/ui-kit/shell/AppShell'
import { NotificationProvider } from '@/providers/NotificationProvider'
import { HoldingDraftReset } from '@/components/pages/investments/HoldingDraftReset'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AppShell>
        <HoldingDraftReset />
        <Suspense fallback={null}>{children}</Suspense>
      </AppShell>
    </NotificationProvider>
  )
}
