'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// FilterChip
// ---------------------------------------------------------------------------

export interface FilterChipProps {
  label: string
  onRemove: () => void
  className?: string
}

export function FilterChip({ label, onRemove, className }: FilterChipProps) {
  const t = useTranslations('common')

  return (
    <span className={cn('tag tag-accent flex items-center gap-1', className)}>
      {label}
      <button
        onClick={onRemove}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onRemove()
          }
        }}
        aria-label={t('removeFilter', { label })}
        className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        type="button"
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>
    </span>
  )
}

// ---------------------------------------------------------------------------
// FilterBar
// ---------------------------------------------------------------------------

export interface FilterBarProps {
  children: React.ReactNode
  onClear?: () => void
  className?: string
}

export function FilterBar({ children, onClear, className }: FilterBarProps) {
  const t = useTranslations('common')

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {children}
      {onClear && (
        <button
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
          type="button"
        >
          {t('clearFilters')}
        </button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// RowActions
// ---------------------------------------------------------------------------

export interface RowActionsItem {
  label: string
  onSelect: () => void
  tone?: 'default' | 'destructive'
}

export interface RowActionsProps {
  items: RowActionsItem[]
  className?: string
}

export function RowActions({ items, className }: RowActionsProps) {
  const t = useTranslations('common')

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-md border bg-card',
          'text-muted-foreground hover:text-foreground hover:bg-muted',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          className,
        )}
        aria-label={t('rowActions')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          className="elev-md z-50 min-w-[160px] overflow-hidden rounded-md border bg-card p-1"
        >
          {items.map((item, i) => (
            <DropdownMenuPrimitive.Item
              key={i}
              onSelect={item.onSelect}
              data-tone={item.tone ?? 'default'}
              className={cn(
                'flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm outline-none',
                'focus:bg-muted focus:text-foreground',
                item.tone === 'destructive' && 'text-destructive focus:text-destructive',
              )}
            >
              {item.label}
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}
