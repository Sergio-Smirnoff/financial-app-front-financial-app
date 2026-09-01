'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Menu } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useUiStore } from '@/lib/store/ui.store'
import { getUserFromCookie } from '@/lib/auth'
import { logout } from '@/lib/api/auth'

export interface TopBarProps {
  /** Slot: ⌘K command bar — filled by plan 04 */
  searchSlot?: React.ReactNode
  /** Slot: currency selector — filled by plan 04 */
  currencySlot?: React.ReactNode
  /** Slot: notification bell — composed by AppShell */
  notificationSlot?: React.ReactNode
}

export function TopBar({ searchSlot, currencySlot, notificationSlot }: TopBarProps) {
  const t = useTranslations('common')
  const { toggleSidebar } = useUiStore()
  const router = useRouter()
  const [user, setUser] = useState<ReturnType<typeof getUserFromCookie>>(null)

  useEffect(() => {
    setUser(getUserFromCookie())
  }, [])

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
        aria-label={t('openMenu')}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* ⌘K search slot */}
      <div className="flex-1">{searchSlot}</div>

      {/* currency selector slot */}
      {currencySlot}

      {user && (
        <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
      )}

      {/* notification bell slot */}
      {notificationSlot}

      <Button variant="ghost" size="icon" onClick={handleLogout} aria-label={t('logout')}>
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  )
}
