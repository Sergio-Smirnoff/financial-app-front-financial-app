import type { AssetType } from '@/types/investments'
import type { AssetTypeSlice, MoneyView } from '@/lib/api/bff/types'

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

export function amountOf(value?: MoneyView | null): number {
  const n = Number(value?.amount)
  return Number.isFinite(n) ? n : 0
}

export function toneOf(n?: number | null): 'gain' | 'loss' | 'neutral' {
  if (n == null || n === 0) return 'neutral'
  return n > 0 ? 'gain' : 'loss'
}
