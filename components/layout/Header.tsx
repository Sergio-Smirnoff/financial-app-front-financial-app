'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'
import { NotificationBell } from './NotificationBell'
import { useUiStore } from '@/lib/store/ui.store'
import { getUserFromCookie } from '@/lib/auth'
import { logout } from '@/lib/api/auth'

interface HeaderProps {
  title: string
  children?: React.ReactNode
}

export function Header({ title, children }: HeaderProps) {
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
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {children}
      </div>

      {user && (
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {user.name}
        </span>
      )}

      <NotificationBell />

      <ThemeToggle />

      <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
        <LogOut className="h-4 w-4" />
      </Button>
    </header>
  )
}
