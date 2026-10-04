'use client'

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Search, Loader2 } from 'lucide-react'
import { useTickerSearch } from '@/lib/hooks/useInvestments'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { TickerSearchResult } from '@/types/investments'
import { formatCurrency } from '@/lib/format'

const RESULTS_MAX_HEIGHT = 320
const RESULTS_MIN_HEIGHT = 96
const RESULTS_OFFSET = 6
const RESULTS_EDGE = 8

function resultsRoom(field: HTMLElement): number {
  const frame = field.closest('[data-page-frame]')
  const floor = Math.min(window.innerHeight, frame?.getBoundingClientRect().bottom ?? window.innerHeight)
  const room = floor - field.getBoundingClientRect().bottom - RESULTS_OFFSET - RESULTS_EDGE
  return Math.max(RESULTS_MIN_HEIGHT, Math.min(RESULTS_MAX_HEIGHT, Math.floor(room)))
}

export interface TickerSearchBoxProps {
  onSelect: (ticker: string, item?: TickerSearchResult) => void
  placeholder?: string
}

export function TickerSearchBox({ onSelect, placeholder }: TickerSearchBoxProps) {
  const t = useTranslations('investments')
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [resultsHeight, setResultsHeight] = useState(RESULTS_MAX_HEIGHT)
  const containerRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)

  const { data: results = [], isLoading } = useTickerSearch(query)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showResults = isOpen && query.trim().length >= 1

  useLayoutEffect(() => {
    const field = fieldRef.current
    if (!showResults || !field) return
    const measure = () => setResultsHeight(resultsRoom(field))
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [showResults])

  const visible = results.slice(0, 8)

  return (
    <div ref={containerRef} className="relative w-full">
      <div ref={fieldRef} className="relative flex items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder ?? t('market.searchPlaceholder')}
          className="pl-10 pr-10 h-11 rounded-xl bg-card border-border font-medium"
        />
        {isLoading && (
          <Loader2 className="absolute right-3.5 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {showResults && (
        <div
          data-testid="ticker-search-results"
          style={{ maxHeight: resultsHeight }}
          className="absolute z-30 mt-1.5 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-xl divide-y divide-border/60"
        >
          {visible.length > 0 ? (
            visible.map((item) => {
              const isPos = item.variation >= 0
              return (
                <button
                  type="button"
                  key={item.ticker}
                  onClick={() => {
                    onSelect(item.ticker, item)
                    setIsOpen(false)
                    setQuery('')
                  }}
                  className="flex w-full items-center justify-between px-4 py-3 text-sm text-left transition-colors hover:bg-muted/60"
                >
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground">{item.ticker}</span>
                      {item.name && (
                        <span className="text-xs text-muted-foreground line-clamp-1">{item.name}</span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      {formatCurrency(item.price, item.currency)}
                    </span>
                  </div>

                  <span
                    className={cn(
                      'text-xs font-mono font-bold px-2 py-0.5 rounded',
                      isPos
                        ? 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400'
                        : 'text-rose-600 bg-rose-500/10 dark:text-rose-400'
                    )}
                  >
                    {isPos ? '+' : ''}
                    {item.variation.toFixed(2)}%
                  </span>
                </button>
              )
            })
          ) : !isLoading ? (
            <div className="px-4 py-3 text-xs text-muted-foreground text-center">
              {t('market.noSearchResults')}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
