import type { MoneyView } from '@/lib/format'
import { formatMoney, formatPercent } from '@/lib/format'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import { useTranslations } from 'next-intl'
import { ScrollTable } from '@/components/ui-kit/table/ScrollTable'

export interface FeeRowData {
  scope: string
  label: string
  amount: MoneyView | null
  pct: number | null
  ivaTreatment: string
}

const IVA_TREATMENT_KEYS: Record<string, string> = {
  TAXED_21: 'ivaTaxed21',
  TAXED_105: 'ivaTaxed105',
  EXEMPT: 'ivaExempt',
}

const FEE_COLUMN_KEYS = {
  scope: 'category',
  label: 'concept',
  amount: 'amount',
  iva: 'iva',
} as const

export function FeeRow({ row }: { row: FeeRowData }) {
  return null // used by FeeTable column definitions
}

export interface FeeTableProps {
  rows: FeeRowData[]
}

export function FeeTable({ rows }: FeeTableProps) {
  const t = useTranslations('common')

  const feeColumns: ColumnDef<FeeRowData, unknown>[] = [
    {
      id: 'scope',
      accessorKey: 'scope',
      header: t(FEE_COLUMN_KEYS.scope),
    },
    {
      id: 'label',
      accessorKey: 'label',
      header: t(FEE_COLUMN_KEYS.label),
    },
    {
      id: 'amount',
      accessorFn: (row) => row,
      header: t(FEE_COLUMN_KEYS.amount),
      cell: ({ getValue }) => {
        const row = getValue() as FeeRowData
        if (row.amount) return formatMoney(row.amount)
        if (row.pct !== null) return formatPercent(row.pct)
        return '–'
      },
    },
    {
      id: 'iva',
      accessorFn: (row) => row.ivaTreatment,
      header: t(FEE_COLUMN_KEYS.iva),
      cell: ({ getValue }) => {
        const treatment = getValue() as string
        const key = IVA_TREATMENT_KEYS[treatment]
        return key ? t(key) : treatment
      },
    },
  ]

  return (
    <ScrollTable<FeeRowData>
      columns={feeColumns}
      rows={rows}
      caption={t('feesTableCaption')}
    />
  )
}
