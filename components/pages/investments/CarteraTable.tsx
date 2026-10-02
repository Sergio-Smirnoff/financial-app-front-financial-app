'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowDown, ArrowUp, ChevronDown, ChevronRight } from 'lucide-react'
import { Money } from '@/components/ui-kit/money/Money'
import { formatPercent, formatQuantity } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AssetTypeSlice, MoneyView, PositionRow } from '@/lib/api/bff/types'
import type { CarteraColumn, CarteraSort, CarteraSortKey } from '@/lib/store/carteraView.store'
import { sortRows, type DisplayedText } from './carteraView'
import { GROUP_COLOR, GROUP_LABEL_KEYS, groupKeyOf, groupPositions, portfolioShare, toneOf, type GroupKey } from './portfolioView'

export interface CarteraTableProps {
  rows: readonly PositionRow[]
  slices: readonly AssetTypeSlice[] | null
  grouped: boolean
  columns: readonly CarteraColumn[]
  sort: CarteraSort
  onSort: (key: CarteraSortKey) => void
  totalMarketValue?: MoneyView | null
  bankNames: ReadonlyMap<string, string>
  renderActions: (row: PositionRow) => React.ReactNode
  phone: boolean
}

const SUBTOTAL_COLUMNS: ReadonlySet<CarteraColumn> = new Set(['marketValue', 'share', 'pnl', 'pnlPct'])
const NUMERIC_COLUMNS: ReadonlySet<CarteraColumn> = new Set([
  'quantity', 'avgCost', 'price', 'marketValue', 'share', 'pnl', 'pnlPct',
])
const HEADER_WIDTH: Partial<Record<CarteraColumn, string>> = { name: 'w-[26%]', bank: 'w-[14%]' }
const TONE_TEXT = { gain: 'text-gain', loss: 'text-loss', neutral: '' } as const
const CELL = 'py-2 px-2 max-[1600px]:py-1.5 max-[1600px]:px-1.5'
const FIGURE = `${CELL} whitespace-nowrap text-right font-mono`
const ACTIONS_HEAD = 'md:sticky md:right-0 md:z-30 md:bg-card'
const ACTIONS_CELL = 'md:sticky md:right-0 md:z-10 md:shadow-[-10px_0_10px_-10px_rgba(0,0,0,0.35)]'
const share = (pct?: number | null) => (pct == null ? '—' : formatPercent(pct, { decimals: 1, signed: false }))
const signedPct = (pct?: number | null) => (pct == null ? '—' : formatPercent(pct))

export function useColumnLabels(): Readonly<Record<CarteraColumn, string>> {
  const t = useTranslations('investments')
  const tc = useTranslations('common')
  return {
    name: t('tabs.colName'),
    assetType: t('cartera.colType'),
    bank: t('cartera.colBank'),
    quantity: tc('quantity'),
    avgCost: t('tabs.colAvgCost'),
    price: t('tabs.colPrice'),
    marketValue: t('shared.totalValue'),
    share: t('tabs.colShare'),
    pnl: t('tabs.colPnlAmount'),
    pnlPct: t('tabs.colPnlPct'),
  }
}

export function CarteraTable({
  rows,
  slices,
  grouped,
  columns,
  sort,
  onSort,
  totalMarketValue,
  bankNames,
  renderActions,
  phone,
}: CarteraTableProps) {
  const t = useTranslations('investments')
  const tc = useTranslations('common')
  const labels = useColumnLabels()
  const [collapsed, setCollapsed] = useState<ReadonlySet<GroupKey>>(new Set())

  const typeLabel = (row: PositionRow) => t(GROUP_LABEL_KEYS[groupKeyOf(row.assetType)])
  const bankLabel = (row: PositionRow) => bankNames.get(row.bankNumber ?? '') ?? row.bankNumber ?? '—'
  const displayed: DisplayedText = (row, column) => (column === 'bank' ? bankLabel(row) : typeLabel(row))
  const sorted = (list: readonly PositionRow[]) => sortRows(list, sort, displayed)

  const toggle = (key: GroupKey) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const header = (key: CarteraSortKey, label: string, numeric: boolean, width = '') => {
    const active = sort.key === key
    return (
      <th
        key={key}
        scope="col"
        aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={cn(CELL, 'whitespace-nowrap max-[1600px]:text-[10.5px]', numeric ? 'text-right' : 'text-left', width)}
      >
        <button type="button" onClick={() => onSort(key)} className="inline-flex items-center gap-1 font-medium hover:text-foreground">
          {label}
          {active && (sort.direction === 'asc' ? <ArrowUp aria-hidden className="h-3 w-3" /> : <ArrowDown aria-hidden className="h-3 w-3" />)}
        </button>
      </th>
    )
  }

  const cell = (column: CarteraColumn, row: PositionRow) => {
    switch (column) {
      case 'name':
        return <td key={column} className={cn(CELL, 'max-w-0 truncate')} title={row.name}>{row.name}</td>
      case 'assetType':
        return <td key={column} className={cn(CELL, 'whitespace-nowrap')}>{typeLabel(row)}</td>
      case 'bank': {
        const bank = bankLabel(row)
        return <td key={column} className={cn(CELL, 'max-w-0 truncate text-muted-foreground')} title={bank}>{bank}</td>
      }
      case 'quantity':
        return <td key={column} className={FIGURE}>{formatQuantity(row.quantity)}</td>
      case 'avgCost':
        return <td key={column} className={FIGURE}><Money value={row.avgCost} /></td>
      case 'price':
        return <td key={column} className={FIGURE}><Money value={row.price} /></td>
      case 'marketValue':
        return <td key={column} className={FIGURE}><Money value={row.marketValue} /></td>
      case 'share':
        return <td key={column} className={FIGURE}>{share(portfolioShare(row.marketValue, totalMarketValue))}</td>
      case 'pnl':
        return <td key={column} className={FIGURE}><Money value={row.pnl} tone={toneOf(row.pnlPct)} /></td>
      case 'pnlPct':
        return <td key={column} className={cn(FIGURE, TONE_TEXT[toneOf(row.pnlPct)])}>{signedPct(row.pnlPct)}</td>
    }
  }

  const groupCell = (column: CarteraColumn, slice: AssetTypeSlice | null) => {
    switch (column) {
      case 'marketValue':
        return (
          <td key={column} data-testid="group-subtotal" className={FIGURE}>
            {slice && <Money value={slice.amount} />}
          </td>
        )
      case 'share':
        return <td key={column} className={FIGURE}>{slice && share(slice.pct)}</td>
      case 'pnl':
        return <td key={column} className={FIGURE}>{slice && <Money value={slice.pnl} tone={toneOf(slice.pnlPct)} />}</td>
      default:
        return <td key={column} className={cn(FIGURE, TONE_TEXT[toneOf(slice?.pnlPct)])}>{slice && signedPct(slice.pnlPct)}</td>
    }
  }

  const rowFor = (row: PositionRow) => (
    <tr key={row.holdingId} data-testid="position-row" className="border-b last:border-0 hover:bg-muted/30 transition">
      <td className={cn(CELL, 'whitespace-nowrap')}>
        <Link href={`/investments/holdings/${row.holdingId}`} className="font-mono font-semibold text-primary hover:underline">
          {row.ticker}
        </Link>
      </td>
      {columns.map((column) => cell(column, row))}
      <td className={cn('whitespace-nowrap bg-card text-right', phone ? 'px-1 py-1' : CELL, ACTIONS_CELL)}>{renderActions(row)}</td>
    </tr>
  )

  const leading = columns.filter((column) => !SUBTOTAL_COLUMNS.has(column)).length
  const subtotalColumns = columns.filter((column) => SUBTOTAL_COLUMNS.has(column))

  const groupLabel = (key: GroupKey, isCollapsed: boolean, count: number) => (
    <button type="button" aria-expanded={!isCollapsed} onClick={() => toggle(key)} className="flex min-w-0 items-center gap-1.5">
      {isCollapsed ? <ChevronRight className="h-3.5 w-3.5 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 shrink-0" />}
      <span aria-hidden="true" className="inline-block h-2 w-2 shrink-0 rounded-sm" style={{ background: GROUP_COLOR[key] }} />
      <span className="truncate">{t(GROUP_LABEL_KEYS[key])}</span>
      <span className="whitespace-nowrap font-normal text-muted-foreground">
        · {phone ? count : t('composition.positionsCount', { count })}
      </span>
    </button>
  )

  const body = grouped ? (
    groupPositions(rows, slices).map((group) => {
      const isCollapsed = collapsed.has(group.key)
      const slice = group.slice
      const count = slice?.count ?? group.rows.length
      return (
        <tbody key={group.key} data-testid="position-group" data-asset-type={group.key}>
          <tr className="border-b bg-muted font-semibold">
            {phone ? (
              <th scope="rowgroup" colSpan={2} className={cn(CELL, 'text-left')}>
                {groupLabel(group.key, isCollapsed, count)}
              </th>
            ) : (
              <>
                <th scope="rowgroup" colSpan={1 + leading} className={cn(CELL, 'text-left')}>
                  {groupLabel(group.key, isCollapsed, count)}
                </th>
                {subtotalColumns.map((column) => groupCell(column, slice))}
                <td className={cn(CELL, 'bg-muted', ACTIONS_CELL)} />
              </>
            )}
          </tr>
          {!isCollapsed && sorted(group.rows).map(rowFor)}
        </tbody>
      )
    })
  ) : (
    <tbody data-testid="position-list">{sorted(rows).map(rowFor)}</tbody>
  )

  return (
    <table data-testid="cartera-table" className="w-full table-auto text-sm max-[1600px]:text-[12.5px]">
      <caption className="sr-only">{t('tabs.positionsCaption')}</caption>
      <thead className="sticky top-0 z-20 bg-card">
        <tr className="border-b text-left text-muted-foreground">
          {header('ticker', tc('ticker'), false)}
          {columns.map((column) => header(column, labels[column], NUMERIC_COLUMNS.has(column), HEADER_WIDTH[column]))}
          <th scope="col" className={cn(CELL, 'text-right', ACTIONS_HEAD)}>
            <span className="sr-only">{tc('actions')}</span>
          </th>
        </tr>
      </thead>
      {rows.length === 0 ? (
        <tbody>
          <tr>
            <td colSpan={columns.length + 2} className="py-8 text-center text-xs text-muted-foreground">
              {t('cartera.noMatch')}
            </td>
          </tr>
        </tbody>
      ) : (
        body
      )}
    </table>
  )
}
