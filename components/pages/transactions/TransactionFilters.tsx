'use client'

import React, { useCallback } from 'react'
import { useQueryState } from 'nuqs'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('transactions')
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
      label: t('filters.chipSearch', { q }),
      onRemove: () => { setQ(null); setPage('1') },
    })
  }

  if (category) {
    const catName = options?.categories?.find((c) => String(c.id) === category)?.name || (category === 'none' ? t('uncategorisedValue') : category)
    activeChips.push({
      key: 'cat',
      label: t('filters.chipCategory', { name: catName }),
      onRemove: () => { setCategory(null); setPage('1') },
    })
  }

  if (account) {
    const accAlias = options?.accounts?.find((a) => a.cbu === account)?.alias || account
    activeChips.push({
      key: 'acc',
      label: t('filters.chipAccount', { name: accAlias }),
      onRemove: () => { setAccount(null); setPage('1') },
    })
  }

  if (method) {
    activeChips.push({
      key: 'method',
      label: t('filters.chipMethod', { name: formatPaymentMethod(method) }),
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
            aria-label={t('filters.byAccount')}
            onChange={(e) => { setAccount(e.target.value || null); setPage('1') }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">{t('filters.allAccounts')}</option>
            {(options?.accounts ?? []).map((acc) => (
              <option key={acc.cbu} value={acc.cbu}>
                {acc.alias || acc.cbu}
              </option>
            ))}
          </select>

          <select
            value={category}
            aria-label={t('filters.byCategory')}
            onChange={(e) => { setCategory(e.target.value || null); setPage('1') }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">{t('filters.allCategories')}</option>
            <option value="none">{t('uncategorisedValue')}</option>
            {(options?.categories ?? []).map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={method}
            aria-label={t('filters.byMethod')}
            onChange={(e) => { setMethod(e.target.value || null); setPage('1') }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">{t('filters.allMethods')}</option>
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
