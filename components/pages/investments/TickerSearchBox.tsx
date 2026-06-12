'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTickerSearch } from '@/lib/hooks/useInvestments'
import { Input } from '@/components/ui/input'

export function TickerSearchBox() {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const { data: results = [] } = useTickerSearch(query)
  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onBlur={() => setTimeout(() => setQuery(''), 150)}
        placeholder="Search a ticker to research…"
        className="h-11 rounded-xl"
      />
      {query && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-xl border border-border bg-popover shadow">
          {results.slice(0, 8).map((result) => (
            <button
              type="button"
              key={result.ticker}
              onClick={() => {
                setQuery('')
                router.push(`/investments/research/${encodeURIComponent(result.ticker)}`)
              }}
              className="flex w-full justify-between px-3 py-2 text-sm hover:bg-muted"
            >
              <span className="font-bold">{result.ticker}</span>
              <span className={result.variation >= 0 ? 'text-green-500' : 'text-red-500'}>
                {result.variation >= 0 ? '+' : ''}{result.variation.toFixed(2)}%
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
