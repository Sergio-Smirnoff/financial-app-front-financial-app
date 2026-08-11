'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useSearch } from '@/lib/hooks/useSearch'
import type { SearchHitResponse } from '@/lib/api/bff/schema'

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
  groups?: SearchGroup[]
  onQueryChange?: (q: string) => void
  loading?: boolean
}

const SECTION_TITLES: Record<string, string> = {
  movements: 'Movimientos',
  positions: 'Posiciones',
  categories: 'Categorías',
}

export function SearchBar({ onQueryChange }: SearchBarProps = {}) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useSearch(query)

  // Notify legacy listener if provided
  useEffect(() => {
    onQueryChange?.(query)
  }, [query, onQueryChange])

  // Open on Cmd+K / Ctrl+K and focus input
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasMinLength = query.trim().length >= 2

  const activeSections = [
    { key: 'movements', title: SECTION_TITLES.movements, section: data?.movements },
    { key: 'positions', title: SECTION_TITLES.positions, section: data?.positions },
    { key: 'categories', title: SECTION_TITLES.categories, section: data?.categories },
  ].filter(
    (s) => s.section?.status === 'OK' && Array.isArray(s.section?.data) && s.section.data.length > 0
  )

  const isAllUnavailable =
    data != null &&
    data.movements?.status === 'UNAVAILABLE' &&
    data.positions?.status === 'UNAVAILABLE' &&
    data.categories?.status === 'UNAVAILABLE'

  const flatHits: SearchHitResponse[] = activeSections.flatMap((s) => s.section?.data ?? [])
  const totalHits = flatHits.length

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
      inputRef.current?.focus()
      return
    }

    if (!isOpen || flatHits.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev < flatHits.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : flatHits.length - 1))
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && flatHits[activeIndex]?.href) {
        e.preventDefault()
        setIsOpen(false)
        window.location.href = flatHits[activeIndex].href!
      }
    }
  }

  let currentHitCount = 0

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div
        role="combobox"
        aria-expanded={isOpen && hasMinLength}
        aria-haspopup="listbox"
        aria-owns="search-results-panel"
        className="relative flex items-center"
      >
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          role="searchbox"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar movimientos, posiciones, categorías..."
          aria-label="Buscar"
          className="w-full rounded-md border border-input bg-background pl-9 pr-12 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <kbd className="absolute right-2.5 hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground pointer-events-none">
          <span>⌘</span>K
        </kbd>
      </div>

      {isOpen && hasMinLength && (
        <div
          id="search-results-panel"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          {isLoading && (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando...
            </div>
          )}

          {!isLoading && isAllUnavailable && (
            <div className="p-4 text-center text-sm text-destructive">
              Error al cargar resultados de búsqueda
            </div>
          )}

          {!isLoading && !isAllUnavailable && (
            <>
              <div role="status" className="sr-only">
                {`${totalHits} ${totalHits === 1 ? 'resultado' : 'resultados'}`}
              </div>

              {totalHits === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Sin resultados
                </div>
              ) : (
                activeSections.map((s) => (
                  <div key={s.key} role="group" aria-label={s.title} className="p-2 border-b last:border-b-0">
                    <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {s.title}
                    </div>
                    <div className="space-y-1 mt-1">
                      {s.section?.data?.map((hit) => {
                        const index = currentHitCount++
                        const isSelected = index === activeIndex
                        return (
                          <a
                            key={hit.id || `${hit.href}-${index}`}
                            href={hit.href}
                            data-testid="search-hit"
                            data-selected={isSelected}
                            className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                              isSelected
                                ? 'bg-accent text-accent-foreground font-medium'
                                : 'hover:bg-accent/50 text-foreground'
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            <span>{hit.label}</span>
                            {hit.sublabel && (
                              <span className="text-xs text-muted-foreground">{hit.sublabel}</span>
                            )}
                          </a>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
