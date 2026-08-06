'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface SidePanelProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

/**
 * Non-modal SidePanel: Escape closes it, focus returns to the trigger,
 * the content behind stays reachable via Tab (non-modal = no inert).
 */
export function SidePanel({ open, onClose, title, children, className }: SidePanelProps) {
  const triggerRef = React.useRef<Element | null>(null)

  // Capture focus origin on open
  React.useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
    } else if (triggerRef.current && triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus()
      triggerRef.current = null
    }
  }, [open])

  // Escape handler
  React.useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="complementary"
      aria-label={title}
      className={cn(
        'fixed inset-y-0 right-0 z-40 flex w-80 flex-col border-l bg-card elev-md',
        'data-[open=true]:animate-in data-[open=false]:animate-out',
        className,
      )}
      data-open={open}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        <h2 className="section-head">{title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  )
}
