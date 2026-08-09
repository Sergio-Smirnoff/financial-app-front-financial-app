import type { MoneyView } from '@/lib/format'
import { formatMoney, formatPercent } from '@/lib/format'
import type { LegacyColumnDef as ColumnDef } from '@tanstack/react-table/legacy'
import { ScrollTable } from '@/components/ui-kit/table/ScrollTable'

export interface FeeRowData {
  scope: string
  label: string
  amount: MoneyView | null
  pct: number | null
  ivaTreatment: string
}

function formatIva(treatment: string): string {
  switch (treatment) {
    case 'TAXED_21':
      return 'IVA 21 %'
    case 'TAXED_105':
      return 'IVA 10,5 %'
    case 'EXEMPT':
      return 'Exento'
    default:
      return treatment
  }
}

export function FeeRow({ row }: { row: FeeRowData }) {
  return null // used by FeeTable column definitions
}

export interface FeeTableProps {
  rows: FeeRowData[]
}

const feeColumns: ColumnDef<FeeRowData, unknown>[] = [
  {
    id: 'scope',
    accessorKey: 'scope',
    header: 'Categoría',
  },
  {
    id: 'label',
    accessorKey: 'label',
    header: 'Concepto',
  },
  {
    id: 'amount',
    accessorFn: (row) => row,
    header: 'Importe',
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
    header: 'IVA',
    cell: ({ getValue }) => formatIva(getValue() as string),
  },
]

export function FeeTable({ rows }: FeeTableProps) {
  return (
    <ScrollTable<FeeRowData>
      columns={feeColumns}
      rows={rows}
      caption="Tabla de comisiones"
    />
  )
}
