'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'
import { useUiStore } from '@/lib/store/ui.store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CURRENCIES } from '@/lib/utils/currency'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const { toggleSidebar, currency, setCurrency } = useUiStore()

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

      <Select value={currency} onValueChange={setCurrency}>
        <SelectTrigger className="w-24 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((c) => (
            <SelectItem key={c} value={c} className="text-xs">
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ThemeToggle />
    </header>
  )
}
