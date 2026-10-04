'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { DollarSign, Pencil, Plus, SlidersHorizontal } from 'lucide-react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useBanks } from '@/lib/hooks/useBanks'
import { useHoldings } from '@/lib/hooks/useInvestments'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { CARTERA_COLUMNS, PHONE_COLUMNS, PHONE_QUERY, useCarteraViewStore } from '@/lib/store/carteraView.store'
import { useHoldingDraftStore } from '@/lib/store/holdingDraft.store'
import type { AssetTypeSlice, InvestmentsKpis, PositionRow, Section } from '@/lib/api/bff/types'
import type { Holding } from '@/types/investments'
import { SellHoldingDialog, type SellHoldingTarget } from './SellHoldingDialog'
import { RecordHoldingDialog } from './RecordHoldingDialog'
import { CarteraTable, useColumnLabels } from './CarteraTable'
import { matchesQuery, visibleColumns } from './carteraView'
import { GROUP_LABEL_KEYS, GROUP_ORDER, amountOf, groupKeyOf, type GroupKey } from './portfolioView'

export interface PortfolioTabProps {
  positionsSection?: Section<PositionRow[]>
  compositionSection?: Section<AssetTypeSlice[]>
  kpis?: InvestmentsKpis | null
  isLoading: boolean
  onRetry?: () => void
}

function sellTargetFor(row: PositionRow, holding: Holding): SellHoldingTarget {
  return {
    id: holding.id,
    ticker: holding.ticker,
    name: holding.name,
    assetType: holding.assetType,
    quantity: holding.quantity,
    exactQuantity: holding.exactQuantity,
    currency: holding.currency,
    currentPrice: row.price?.currency === holding.currency ? amountOf(row.price) : null,
    avgPurchasePrice: holding.avgPurchasePrice,
  }
}

export function PortfolioTab({
  positionsSection,
  compositionSection,
  kpis,
  isLoading,
  onRetry,
}: PortfolioTabProps) {
  const t = useTranslations('investments')
  const tc = useTranslations('common')
  const { data: holdings, isError: holdingsFailed, refetch: refetchHoldings } = useHoldings()
  const { banks } = useBanks()
  const columnLabels = useColumnLabels()
  const isPhone = useMediaQuery(PHONE_QUERY)
  const [selling, setSelling] = useState<SellHoldingTarget | null>(null)
  const [query, setQuery] = useState('')
  const [types, setTypes] = useState<ReadonlySet<GroupKey>>(new Set())

  const grouped = useCarteraViewStore((s) => s.grouped)
  const columns = useCarteraViewStore((s) => s.columns)
  const sort = useCarteraViewStore((s) => s.sort)
  const setGrouped = useCarteraViewStore((s) => s.setGrouped)
  const toggleColumn = useCarteraViewStore((s) => s.toggleColumn)
  const sortBy = useCarteraViewStore((s) => s.sortBy)
  const resetView = useCarteraViewStore((s) => s.reset)
  const draft = useHoldingDraftStore((s) => s.draft)
  const openCreate = useHoldingDraftStore((s) => s.openCreate)
  const openEdit = useHoldingDraftStore((s) => s.openEdit)
  const clearDraft = useHoldingDraftStore((s) => s.clear)

  useEffect(() => {
    void useCarteraViewStore.persist.rehydrate()
  }, [])

  const shownColumns = visibleColumns(isPhone ? PHONE_COLUMNS : columns, grouped)
  const holdingsById = useMemo(() => new Map((holdings ?? []).map((h) => [h.id, h])), [holdings])
  const bankNames = useMemo(() => new Map(banks.map((b) => [b.bankNumber, b.name])), [banks])
  const slices = compositionSection?.status === 'OK' ? compositionSection.data ?? [] : null
  const actionsUnavailable = holdingsFailed ? t('cartera.holdingsUnavailable') : undefined
  const actionsDescribedBy = holdingsFailed ? 'holdings-unavailable' : undefined

  const toggleType = (key: GroupKey) =>
    setTypes((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const renderActions = (row: PositionRow) => {
    const holding = row.holdingId != null ? holdingsById.get(row.holdingId) : undefined
    const edit = () => holding && openEdit(holding.id)
    const sell = () => holding && setSelling(sellTargetFor(row, holding))
    if (isPhone) {
      return (
        <>
          <Button
            size="icon"
            variant="ghost"
            disabled={!holding}
            aria-label={t('cartera.editAria', { ticker: row.ticker ?? '' })}
            title={actionsUnavailable ?? t('holdings.editAction')}
            aria-describedby={actionsDescribedBy}
            className="h-7 w-7"
            onClick={edit}
          >
            <Pencil aria-hidden className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            disabled={!holding}
            aria-label={t('cartera.sellAria', { ticker: row.ticker ?? '' })}
            title={actionsUnavailable ?? t('holdings.sellAction')}
            aria-describedby={actionsDescribedBy}
            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={sell}
          >
            <DollarSign aria-hidden className="h-4 w-4" />
          </Button>
        </>
      )
    }
    return (
      <>
        <Button
          size="sm"
          variant="ghost"
          disabled={!holding}
          title={actionsUnavailable}
          aria-describedby={actionsDescribedBy}
          className="h-7 px-1.5 text-xs font-bold"
          onClick={edit}
        >
          {t('holdings.editAction')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={!holding}
          title={actionsUnavailable}
          aria-describedby={actionsDescribedBy}
          className="h-7 px-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 font-bold"
          onClick={sell}
        >
          {t('holdings.sellAction')}
        </Button>
      </>
    )
  }

  return (
    <div className="elev-sm rounded-xl border bg-card flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-3">
        <h3 className="section-head">{t('tabs.positionsHeading')}</h3>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('cartera.filterPlaceholder')}
            aria-label={t('cartera.filterLabel')}
            className="h-8 min-w-0 flex-1 text-xs max-sm:basis-full sm:w-56 sm:flex-none"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                <SlidersHorizontal aria-hidden className="h-3.5 w-3.5" />
                {t('cartera.view')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <DropdownMenuCheckboxItem
                checked={grouped}
                onCheckedChange={(checked) => {
                  setGrouped(checked === true)
                  setTypes(new Set())
                }}
                onSelect={(e) => e.preventDefault()}
              >
                {t('cartera.groupByType')}
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {isPhone ? (
                <p data-testid="cartera-phone-note" className="px-2 py-1.5 text-xs text-muted-foreground">
                  {t('cartera.phoneColumnsNote')}
                </p>
              ) : (
                <>
                  <DropdownMenuLabel>{t('cartera.columns')}</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem checked disabled>
                    {tc('ticker')}
                  </DropdownMenuCheckboxItem>
                  {CARTERA_COLUMNS.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column}
                      checked={columns[column] && !(grouped && column === 'assetType')}
                      disabled={grouped && column === 'assetType'}
                      onCheckedChange={() => toggleColumn(column)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {columnLabels[column]}
                    </DropdownMenuCheckboxItem>
                  ))}
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  resetView()
                  setTypes(new Set())
                }}
              >
                {t('cartera.reset')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" data-testid="register-holding-trigger" onClick={() => openCreate()} className="h-8 gap-1.5 text-xs font-semibold">
            <Plus className="h-3.5 w-3.5" />
            {t('holdings.new')}
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 px-5 pb-4">
        {holdingsFailed && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/60 px-3 py-1.5 text-xs">
            <span id="holdings-unavailable" className="text-muted-foreground">{t('cartera.holdingsUnavailable')}</span>
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => refetchHoldings()}>
              {tc('retry')}
            </Button>
          </div>
        )}
        <SectionState
          section={positionsSection}
          isLoading={isLoading}
          onRetry={onRetry}
          emptyTitle={t('tabs.positionsEmptyTitle')}
          emptyDescription={t('tabs.positionsEmptyDescription')}
          emptyTestId="positions-empty"
          emptyAction={
            <Button size="sm" data-testid="positions-empty-register" onClick={() => openCreate()} className="gap-1.5 font-bold">
              <Plus className="h-4 w-4" />
              {t('holdings.new')}
            </Button>
          }
          skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
        >
          {(positions) => {
            const shown = positions.filter(
              (row) =>
                matchesQuery(row, query) && (grouped || types.size === 0 || types.has(groupKeyOf(row.assetType))),
            )
            const presentTypes = GROUP_ORDER.filter((key) => positions.some((row) => groupKeyOf(row.assetType) === key))
            return (
              <>
                {!grouped && (
                  <div role="group" aria-label={t('cartera.typeFilter')} className="flex flex-wrap items-center gap-1.5">
                    {presentTypes.map((key) => (
                      <Button
                        key={key}
                        type="button"
                        size="sm"
                        variant="outline"
                        aria-pressed={types.has(key)}
                        onClick={() => toggleType(key)}
                        className="h-7 rounded-full px-3 text-xs aria-pressed:bg-accent aria-pressed:text-accent-foreground"
                      >
                        {t(GROUP_LABEL_KEYS[key])}
                      </Button>
                    ))}
                  </div>
                )}
                {shown.length < positions.length && (
                  <p data-testid="cartera-filter-summary" className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                    <span>{t('cartera.showing', { shown: shown.length, total: positions.length })}</span>
                    {grouped && <span>{t('cartera.subtotalsNote')}</span>}
                  </p>
                )}
                <div
                  data-testid="positions-scroll"
                  className="relative min-h-0 flex-1 overflow-auto md:max-h-[70vh] frame:max-h-none max-md:overflow-visible"
                >
                  <CarteraTable
                    rows={shown}
                    slices={slices}
                    grouped={grouped}
                    columns={shownColumns}
                    sort={sort}
                    onSort={sortBy}
                    totalMarketValue={kpis?.marketValue}
                    bankNames={bankNames}
                    renderActions={renderActions}
                    phone={isPhone}
                  />
                </div>
              </>
            )
          }}
        </SectionState>
      </div>

      <SellHoldingDialog holding={selling} open={!!selling} onOpenChange={(open) => !open && setSelling(null)} />
      <RecordHoldingDialog draft={draft} onClose={clearDraft} />
    </div>
  )
}
