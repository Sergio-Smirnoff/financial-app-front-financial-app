'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Command } from 'cmdk'
import { Search, Loader2 } from 'lucide-react'

export interface SearchHit {
  id: string
  label: string
  href: string
  sublabel?: string
}

export interface SearchGroup {
  key: string
  label: string
  hits: SearchHit[]
}

export interface SearchBarProps {
  groups: SearchGroup[]
  onQueryChange: (q: string) => void
  loading: boolean
}

export function SearchBar({ groups, onQueryChange, loading }: SearchBarProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Open on Cmd+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleValueChange = useCallback(
    (value: string) => {
      setQuery(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onQueryChange(value)
      }, 250)
    },
    [onQueryChange]
  )

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar (⌘K)"
        className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 text-[10px] font-medium">
          <span>⌘</span>K
        </kbd>
      </button>
    )
  }

  return (
    <div
      role="dialog"
      aria-label="Buscar"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      <Command
        className="relative z-10 w-full max-w-lg rounded-xl border bg-popover shadow-2xl"
        shouldFilter={false}
      >
        <div className="flex items-center gap-2 border-b px-4 py-3">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
          <Command.Input
            value={query}
            onValueChange={handleValueChange}
            placeholder="Buscar movimientos, cuentas, posiciones..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd
            className="hidden sm:inline-flex h-5 items-center rounded border bg-muted px-1.5 text-[10px] font-medium cursor-pointer"
            onClick={() => setOpen(false)}
          >
            Esc
          </kbd>
        </div>

        <Command.List className="max-h-80 overflow-y-auto p-2">
          {groups.length === 0 && !loading && (
            <Command.Empty className="py-8 text-center text-sm text-muted-foreground">
              Sin resultados
            </Command.Empty>
          )}

          {groups.map((group) => (
            <Command.Group
              key={group.key}
              aria-label={group.label}
              heading={
                <span className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </span>
              }
            >
              {group.hits.map((hit) => (
                <Command.Item
                  key={hit.id}
                  value={hit.id}
                  onSelect={() => {
                    setOpen(false)
                    window.location.href = hit.href
                  }}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent data-[selected=true]:bg-accent"
                >
                  {hit.label}
                  {hit.sublabel && (
                    <span className="ml-auto text-xs text-muted-foreground">{hit.sublabel}</span>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </div>
  )
}
