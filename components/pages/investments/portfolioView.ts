import { amountOf } from '@/lib/format'
import type { AssetType } from '@/types/investments'
import type { AssetTypeSlice, MoneyView, PositionRow } from '@/lib/api/bff/types'

export type GroupKey = AssetType | 'OTHER'

export const GROUP_ORDER: readonly GroupKey[] = ['BOND', 'CEDEAR', 'STOCK', 'FCI', 'OTHER']

export const GROUP_LABEL_KEYS = {
  BOND: 'groups.BOND',
  CEDEAR: 'groups.CEDEAR',
  STOCK: 'groups.STOCK',
  FCI: 'groups.FCI',
  OTHER: 'groups.OTHER',
} as const satisfies Record<GroupKey, string>

export const GROUP_COLOR: Readonly<Record<GroupKey, string>> = {
  BOND: 'var(--chart-5)',
  CEDEAR: 'var(--chart-4)',
  STOCK: 'var(--chart-1)',
  FCI: 'var(--chart-2)',
  OTHER: 'var(--chart-3)',
}

export function groupKeyOf(assetType?: string | null): GroupKey {
  return assetType === 'BOND' || assetType === 'CEDEAR' || assetType === 'STOCK' || assetType === 'FCI'
    ? assetType
    : 'OTHER'
}

export function orderSlices(slices: readonly AssetTypeSlice[]): AssetTypeSlice[] {
  return [...slices].sort(
    (a, b) => GROUP_ORDER.indexOf(groupKeyOf(a.assetType)) - GROUP_ORDER.indexOf(groupKeyOf(b.assetType)),
  )
}

export const TONE_TEXT = { gain: 'text-gain', loss: 'text-loss', neutral: '' } as const

export function toneOf(n?: number | null): 'gain' | 'loss' | 'neutral' {
  if (n == null || n === 0) return 'neutral'
  return n > 0 ? 'gain' : 'loss'
}

export interface PositionGroup {
  key: GroupKey
  rows: PositionRow[]
  slice: AssetTypeSlice | null
}

export function groupPositions(
  rows: readonly PositionRow[],
  slices: readonly AssetTypeSlice[] | null,
): PositionGroup[] {
  return GROUP_ORDER.map((key) => ({
    key,
    rows: rows
      .filter((row) => groupKeyOf(row.assetType) === key)
      .sort(
        (a, b) =>
          (a.ticker ?? '').localeCompare(b.ticker ?? '', 'es-AR') || (a.holdingId ?? 0) - (b.holdingId ?? 0),
      ),
    slice: slices?.find((slice) => groupKeyOf(slice.assetType) === key) ?? null,
  })).filter((group) => group.rows.length > 0)
}

export function portfolioShare(value?: MoneyView | null, total?: MoneyView | null): number | null {
  const whole = amountOf(total)
  if (!value || whole === 0) return null
  return (amountOf(value) / whole) * 100
}

export function toggled<T>(set: ReadonlySet<T>, key: T): ReadonlySet<T> {
  const next = new Set(set)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  return next
}
