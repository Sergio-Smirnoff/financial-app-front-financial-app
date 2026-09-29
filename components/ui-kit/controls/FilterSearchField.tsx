'use client'

import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FilterSearchFieldProps {
  value: string
  onValueChange: (value: string) => void
  label: string
  className?: string
}

export function FilterSearchField({ value, onValueChange, label, className }: FilterSearchFieldProps) {
  return (
    <div className={cn('relative w-full max-w-sm', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={label}
        aria-label={label}
        className="h-9 w-full rounded-md border border-input bg-background py-1 pl-9 pr-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
    </div>
  )
}
