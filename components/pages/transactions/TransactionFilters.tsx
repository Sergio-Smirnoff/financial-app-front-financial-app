'use client'

import React, { useCallback } from 'react'
import { useQueryState } from 'nuqs'
import { FilterBar, FilterChip } from '@/components/ui-kit/controls/FilterBar'
import { SearchBar } from '@/components/ui-kit/controls/SearchBar'

export interface TransactionFilterOptions {
  categories: { id: number; name: string }[]
  accounts: { cbu: string; alias: string }[]
}

export interface TransactionFiltersProps {
  options?: TransactionFilterOptions
}

export function TransactionFilters({ options }: TransactionFiltersProps) {
  const [q, setQ] = useQueryState('q', { defaultValue: '' })
  const [category, setCategory] = useQueryState('categories', { defaultValue: '' })
  const [account, setAccount] = useQueryState('accounts', { defaultValue: '' })
  const [, setPage] = useQueryState('page', { defaultValue: '1' })

  const handleClear = useCallback(() => {
    setQ(null)
    setCategory(null)
    setAccount(null)
    setPage('1')
  }, [setQ, setCategory, setAccount, setPage])

  const activeChips: { key: string; label: string; onRemove: () => void }[] = []

  if (q) {
    activeChips.push({
      key: 'q',
      label: `Búsqueda: ${q}`,
      onRemove: () => { setQ(null); setPage('1') },
    })
  }

  if (category) {
    const catName = options?.categories.find((c) => String(c.id) === category)?.name || (category === 'none' ? 'Sin categorizar' : category)
    activeChips.push({
      key: 'cat',
      label: `Categoría: ${catName}`,
      onRemove: () => { setCategory(null); setPage('1') },
    })
  }

  if (account) {
    const accAlias = options?.accounts.find((a) => a.cbu === account)?.alias || account
    activeChips.push({
      key: 'acc',
      label: `Cuenta: ${accAlias}`,
      onRemove: () => { setAccount(null); setPage('1') },
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchBar groups={[]} onQueryChange={(newQ) => { setQ(newQ || null); setPage('1') }} loading={false} />

        <div className="flex flex-wrap items-center gap-2">
          {(options?.categories ?? []).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => { setCategory(category === String(cat.id) ? null : String(cat.id)); setPage('1') }}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                category === String(cat.id) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {activeChips.length > 0 && (
        <FilterBar onClear={handleClear}>
          {activeChips.map((chip) => (
            <FilterChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
          ))}
        </FilterBar>
      )}
    </div>
  )
}
