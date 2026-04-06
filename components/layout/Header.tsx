'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'
import { useUiStore } from '@/lib/store/ui.store'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { toggleSidebar } = useUiStore()

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

      <h1 className="flex-1 text-base font-semibold">{title}</h1>

      <ThemeToggle />
    </header>
  )
}
