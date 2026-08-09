'use client'

import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export interface ToolbarProps {
  left?: React.ReactNode
  right?: React.ReactNode
  className?: string
}

export function Toolbar({ left, right, className }: ToolbarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b bg-background px-4 py-2',
        className
      )}
    >
      <div className="flex items-center gap-2">{left}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  )
}

export interface ToggleRowProps {
  id: string
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export function ToggleRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  className,
}: ToggleRowProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4 py-4', className)}>
      <div className="flex flex-col gap-1">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-labelledby={id}
      />
    </div>
  )
}

export interface SaveBarProps {
  isDirty: boolean
  onSave: () => void
  onDiscard: () => void
  saving?: boolean
}

export function SaveBar({ isDirty, onSave, onDiscard, saving }: SaveBarProps) {
  if (!isDirty) return null

  return (
    <div
      role="region"
      aria-label="Cambios sin guardar"
      className="sticky bottom-0 z-20 flex items-center justify-between gap-4 border-t bg-background/95 backdrop-blur px-6 py-3 shadow-lg"
    >
      <p className="text-sm text-muted-foreground">Tienes cambios sin guardar.</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDiscard}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
        >
          Descartar
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
