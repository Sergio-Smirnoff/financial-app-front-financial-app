'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTickerSearch } from '@/lib/hooks/useInvestments'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function TickerSearchBox() {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const { data: results = [] } = useTickerSearch(query)
  const visible = results.slice(0, 8)
  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onBlur={() => setTimeout(() => setQuery(''), 150)}
        placeholder="Search a ticker to research…"
        className="h-11 rounded-xl"
      />
      {query && visible.length > 0 && (
        <div className="absolute z-10 mt-1.5 w-full rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
          {visible.map((result, index) => (
            <button
              type="button"
              key={result.ticker}
              onClick={() => {
                setQuery('')
                router.push(`/investments/research/${encodeURIComponent(result.ticker)}`)
              }}
              className={cn(
                'flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-muted',
                index !== visible.length - 1 && 'border-b border-border/50',
              )}
            >
              <div className="flex flex-col items-start">
                <span className="font-bold text-foreground">{result.ticker}</span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {result.currency} {result.price.toLocaleString()}
                </span>
              </div>
              <span
                className={cn(
                  'text-xs font-bold tabular-nums',
                  result.variation >= 0 ? 'text-green-500' : 'text-red-500',
                )}
              >
                {result.variation >= 0 ? '+' : ''}
                {result.variation.toFixed(2)}%
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
