'use client'

import React, { useCallback } from 'react'
import { useQueryState } from 'nuqs'
import { FilterBar, FilterChip } from '@/components/ui-kit/controls/FilterBar'
import { formatPaymentMethod } from '@/lib/format'
import { SearchBar } from '@/components/ui-kit/controls/SearchBar'

export interface TransactionFilterOptions {
  accounts?: { cbu?: string; alias?: string }[]
  categories?: { id?: number; name?: string }[]
  methods?: string[]
}

export interface TransactionFiltersProps {
  options?: TransactionFilterOptions
}

export function TransactionFilters({ options }: TransactionFiltersProps) {
  const [q, setQ] = useQueryState('q', { defaultValue: '' })
  const [category, setCategory] = useQueryState('categories', { defaultValue: '' })
  const [account, setAccount] = useQueryState('accounts', { defaultValue: '' })
  const [method, setMethod] = useQueryState('method', { defaultValue: '' })
  const [, setPage] = useQueryState('page', { defaultValue: '1' })

  const handleClear = useCallback(() => {
    setQ(null)
    setCategory(null)
    setAccount(null)
    setMethod(null)
    setPage('1')
  }, [setQ, setCategory, setAccount, setMethod, setPage])

  const activeChips: { key: string; label: string; onRemove: () => void }[] = []

  if (q) {
    activeChips.push({
      key: 'q',
      label: `Búsqueda: ${q}`,
      onRemove: () => { setQ(null); setPage('1') },
    })
  }

  if (category) {
    const catName = options?.categories?.find((c) => String(c.id) === category)?.name || (category === 'none' ? 'Sin categorizar' : category)
    activeChips.push({
      key: 'cat',
      label: `Categoría: ${catName}`,
      onRemove: () => { setCategory(null); setPage('1') },
    })
  }

  if (account) {
    const accAlias = options?.accounts?.find((a) => a.cbu === account)?.alias || account
    activeChips.push({
      key: 'acc',
      label: `Cuenta: ${accAlias}`,
      onRemove: () => { setAccount(null); setPage('1') },
    })
  }

  if (method) {
    activeChips.push({
      key: 'method',
      label: `Método: ${formatPaymentMethod(method)}`,
      onRemove: () => { setMethod(null); setPage('1') },
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchBar groups={[]} onQueryChange={(newQ) => { setQ(newQ || null); setPage('1') }} loading={false} />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={account}
            aria-label="Filtrar por cuenta"
            onChange={(e) => { setAccount(e.target.value || null); setPage('1') }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Todas las cuentas</option>
            {(options?.accounts ?? []).map((acc) => (
              <option key={acc.cbu} value={acc.cbu}>
                {acc.alias || acc.cbu}
              </option>
            ))}
          </select>

          <select
            value={category}
            aria-label="Filtrar por categoría"
            onChange={(e) => { setCategory(e.target.value || null); setPage('1') }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Todas las categorías</option>
            <option value="none">Sin categorizar</option>
            {(options?.categories ?? []).map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={method}
            aria-label="Filtrar por método"
            onChange={(e) => { setMethod(e.target.value || null); setPage('1') }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">Todos los métodos</option>
            {(options?.methods ?? []).map((m) => (
              <option key={m} value={m}>
                {formatPaymentMethod(m)}
              </option>
            ))}
          </select>
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
