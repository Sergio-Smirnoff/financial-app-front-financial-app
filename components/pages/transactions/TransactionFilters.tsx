'use client'

import React from 'react'
import { useQueryStates } from 'nuqs'
import { useTranslations } from 'next-intl'
import { FilterBar, FilterChip } from '@/components/ui-kit/controls/FilterBar'
import { FilterSearchField } from '@/components/ui-kit/controls/FilterSearchField'
import { MultiSelectFilter, type MultiSelectOption } from '@/components/ui-kit/controls/MultiSelectFilter'
import { formatPaymentMethod } from '@/lib/format'
import { transactionFilterParams, UNCATEGORISED } from './transactionFilterParams'

export interface TransactionFilterOptions {
  accounts?: { cbu?: string; alias?: string }[]
  categories?: { id?: number; name?: string }[]
  methods?: string[]
}

export interface TransactionFiltersProps {
  options?: TransactionFilterOptions
}

const SELECT_CLASS =
  'h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

export function TransactionFilters({ options }: TransactionFiltersProps) {
  const t = useTranslations('transactions')
  const [filters, setFilters] = useQueryStates(transactionFilterParams)
  const { q, categories, accounts, method } = filters

  const categoryOptions: MultiSelectOption[] = [
    { value: UNCATEGORISED, label: t('uncategorisedValue') },
    ...(options?.categories ?? []).flatMap((c) =>
      c.id != null && c.name ? [{ value: String(c.id), label: c.name }] : [],
    ),
  ]
  const categoryLabel = (value: string) =>
    categoryOptions.find((o) => o.value === value)?.label ?? value

  const categoryTrigger =
    categories.length === 0
      ? t('filters.allCategories')
      : categories.length === 1
        ? categoryLabel(categories[0])
        : t('filters.categoriesSelected', { count: categories.length })

  const activeChips: { key: string; label: string; onRemove: () => void }[] = []

  if (q) {
    activeChips.push({
      key: 'q',
      label: t('filters.chipSearch', { q }),
      onRemove: () => setFilters({ q: null, page: null }),
    })
  }

  for (const value of categories) {
    activeChips.push({
      key: `cat-${value}`,
      label: t('filters.chipCategory', { name: categoryLabel(value) }),
      onRemove: () => setFilters({ categories: categories.filter((c) => c !== value), page: null }),
    })
  }

  if (accounts) {
    const accAlias = options?.accounts?.find((a) => a.cbu === accounts)?.alias || accounts
    activeChips.push({
      key: 'acc',
      label: t('filters.chipAccount', { name: accAlias }),
      onRemove: () => setFilters({ accounts: null, page: null }),
    })
  }

  if (method) {
    activeChips.push({
      key: 'method',
      label: t('filters.chipMethod', { name: formatPaymentMethod(method) }),
      onRemove: () => setFilters({ method: null, page: null }),
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterSearchField
          value={q}
          label={t('filters.search')}
          onValueChange={(value) => setFilters({ q: value || null, page: null })}
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={accounts}
            aria-label={t('filters.byAccount')}
            onChange={(e) => setFilters({ accounts: e.target.value || null, page: null })}
            className={SELECT_CLASS}
          >
            <option value="">{t('filters.allAccounts')}</option>
            {(options?.accounts ?? []).map((acc) => (
              <option key={acc.cbu} value={acc.cbu}>
                {acc.alias || acc.cbu}
              </option>
            ))}
          </select>

          <MultiSelectFilter
            label={t('filters.byCategory')}
            triggerText={categoryTrigger}
            options={categoryOptions}
            selected={categories}
            onSelectedChange={(next) => setFilters({ categories: next.length ? next : null, page: null })}
          />

          <select
            value={method}
            aria-label={t('filters.byMethod')}
            onChange={(e) => setFilters({ method: e.target.value || null, page: null })}
            className={SELECT_CLASS}
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
        <FilterBar onClear={() => setFilters(null)}>
          {activeChips.map((chip) => (
            <FilterChip key={chip.key} label={chip.label} onRemove={chip.onRemove} />
          ))}
        </FilterBar>
      )}
    </div>
  )
}
