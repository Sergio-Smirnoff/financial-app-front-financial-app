'use client'

import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface MultiSelectOption {
  value: string
  label: string
}

export interface MultiSelectFilterProps {
  label: string
  triggerText: string
  options: MultiSelectOption[]
  selected: string[]
  onSelectedChange: (selected: string[]) => void
  className?: string
}

export function MultiSelectFilter({
  label,
  triggerText,
  options,
  selected,
  onSelectedChange,
  className,
}: MultiSelectFilterProps) {
  const toggle = (value: string, checked: boolean) => {
    const next = checked ? [...selected, value] : selected.filter((v) => v !== value)
    const known = options.map((o) => o.value)
    onSelectedChange([
      ...known.filter((v) => next.includes(v)),
      ...next.filter((v) => !known.includes(v)),
    ])
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${label}: ${triggerText}`}
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          className,
        )}
      >
        <span className="max-w-[12rem] truncate">{triggerText}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 min-w-[14rem]">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onCheckedChange={(checked) => toggle(option.value, checked === true)}
            onSelect={(e) => e.preventDefault()}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
