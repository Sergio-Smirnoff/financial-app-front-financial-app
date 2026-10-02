import type { PositionRow } from '@/lib/api/bff/types'
import {
  CARTERA_COLUMNS,
  type CarteraColumn,
  type CarteraSort,
  type CarteraSortKey,
  type ColumnVisibility,
} from '@/lib/store/carteraView.store'
import { amountOf } from './portfolioView'

export type DisplayedText = (row: PositionRow, column: 'assetType' | 'bank') => string

export function visibleColumns(columns: ColumnVisibility, grouped: boolean): CarteraColumn[] {
  return CARTERA_COLUMNS.filter((column) => columns[column] && !(grouped && column === 'assetType'))
}

export function matchesQuery(row: PositionRow, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (row.ticker ?? '').toLowerCase().includes(needle) || (row.name ?? '').toLowerCase().includes(needle)
}

function sortValue(row: PositionRow, key: CarteraSortKey, displayed?: DisplayedText): string | number | null {
  switch (key) {
    case 'ticker':
      return row.ticker ?? ''
    case 'name':
      return row.name ?? ''
    case 'assetType':
      return displayed ? displayed(row, key) : row.assetType ?? ''
    case 'bank':
      return displayed ? displayed(row, key) : row.bankNumber ?? ''
    case 'quantity':
      return Number(row.quantity ?? 0)
    case 'avgCost':
      return amountOf(row.avgCost)
    case 'price':
      return amountOf(row.price)
    case 'marketValue':
    case 'share':
      return amountOf(row.marketValue)
    case 'pnl':
      return amountOf(row.pnl)
    case 'pnlPct':
      return row.pnlPct ?? null
  }
}

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b, 'es-AR')
  return Number(a) - Number(b)
}

export function sortRows(rows: readonly PositionRow[], sort: CarteraSort, displayed?: DisplayedText): PositionRow[] {
  const sign = sort.direction === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    const left = sortValue(a, sort.key, displayed)
    const right = sortValue(b, sort.key, displayed)
    if (left === null || right === null) {
      if (left !== right) return left === null ? 1 : -1
    } else {
      const primary = compareValues(left, right)
      if (primary !== 0) return primary * sign
    }
    return compareValues(a.ticker ?? '', b.ticker ?? '') || (a.holdingId ?? 0) - (b.holdingId ?? 0)
  })
}
