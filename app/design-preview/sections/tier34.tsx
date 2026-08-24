'use client'

import React, { useState } from 'react'
import { DataTable } from '@/components/ui-kit/table/DataTable'
import { ScrollTable } from '@/components/ui-kit/table/ScrollTable'
import { Pagination } from '@/components/ui-kit/table/Pagination'
import { BulkActionBar } from '@/components/ui-kit/table/BulkActionBar'
import { ListRow, DueRow } from '@/components/ui-kit/row/ListRow'
import { ProgressRow } from '@/components/ui-kit/row/ProgressRow'
import { StatusDot } from '@/components/ui-kit/row/StatusDot'
import { DetailList } from '@/components/ui-kit/row/DetailList'
import { SearchBar } from '@/components/ui-kit/controls/SearchBar'
import { Toolbar, ToggleRow, SaveBar } from '@/components/ui-kit/controls/Toolbar'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import { FeeTable } from '@/components/ui-kit/data/FeeTable'
import { AccountCard } from '@/components/ui-kit/page/banks/AccountCard'
import { CreditCardCard } from '@/components/ui-kit/page/banks/CreditCardCard'
import { MarketStrip } from '@/components/ui-kit/page/investments/MarketStrip'
import { StockBar } from '@/components/ui-kit/page/investments/StockBar'
import { QuotePill } from '@/components/ui-kit/page/investments/QuotePill'
import { PositionForm } from '@/components/ui-kit/page/investments/PositionForm'
import { AlertMark } from '@/components/ui-kit/page/investments/AlertMark'
import { Stepper } from '@/components/ui-kit/page/imports/Stepper'
import { Dropzone } from '@/components/ui-kit/page/imports/Dropzone'
import { FileProgress } from '@/components/ui-kit/page/imports/FileProgress'
import { MoneyView } from '@/lib/format'

const mockMoney = (amount: string, currency = 'ARS'): MoneyView => ({
  amount,
  currency,
  secondary: null,
})

const tableCols = [
  { id: 'date', accessorKey: 'date', header: 'Fecha' },
  { id: 'desc', accessorKey: 'desc', header: 'Descripción' },
  { id: 'amount', accessorKey: 'amount', header: 'Monto' },
]

const tableRows = [
  { id: '1', date: '2026-08-01', desc: 'Supermercado', amount: '$ 45.000' },
  { id: '2', date: '2026-08-02', desc: 'Transferencia recibida', amount: '$ 120.000' },
]

export default function Tier34Section() {
  const [page, setPage] = useState(1)
  const [toggled, setToggled] = useState(true)
  const [dirty, setDirty] = useState(true)

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h2 className="section-head">Tables, Pagination & Selection</h2>
        <div className="space-y-4">
          <DataTable columns={tableCols} rows={tableRows} caption="Movimientos recientes" />
          <div className="flex items-center justify-between">
            <Pagination page={page} totalPages={5} onChange={setPage} />
            <BulkActionBar count={2} actions={[{ label: 'Exportar', onSelect: () => {} }]} onClear={() => {}} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-head">Rows, Dots & Progress</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <ListRow label="Suscripción Netflix" sublabel="Servicios" right={<span className="font-semibold text-rose-500">-$ 8.500</span>} />
            <DueRow label="Vencimiento Tarjeta Visa" dueDate="2026-08-15" amount={mockMoney('150000')} />
            <ProgressRow label="Presupuesto Comida" value={85000} max={100000} />
            <ProgressRow label="Presupuesto Ocio (Excedido)" value={45000} max={30000} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <StatusDot tone="ok" label="Conectado" />
              <StatusDot tone="warn" label="Pendiente" />
              <StatusDot tone="error" label="Error de sync" />
              <StatusDot tone="neutral" label="Inactivo" />
            </div>
            <DetailList items={[{ term: 'ID de transacción', detail: 'tx_998124' }, { term: 'Canal', detail: 'Home Banking' }]} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-head">Controls & Data Display</h2>
        <div className="space-y-4">
          <Toolbar left={<span className="font-medium text-sm">Filtros activos</span>} right={<SearchBar groups={[]} onQueryChange={() => {}} loading={false} />} />
          <ToggleRow id="notifications-toggle" label="Notificaciones de gastos" description="Recibir alertas cuando un presupuesto se exceda" checked={toggled} onCheckedChange={setToggled} />
          <div className="flex items-center gap-4">
            <FreshnessStamp observedAt="2026-08-23T12:00:00Z" />
            <AlertMark tone="warn" label="Precios desactualizados" />
          </div>
          <FeeTable rows={[{ scope: 'Caja de ahorro', label: 'Mantenimiento mensual', amount: mockMoney('2500'), pct: null, ivaTreatment: 'TAXED_21' }]} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="section-head">Page-Specific Cards (Banks, Investments, Imports)</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <AccountCard account={{ id: 'acc-1', name: 'Cuenta Corriente ARS', bank: 'Galicia', cbu: '0070123456789012345678', currency: 'ARS', balance: mockMoney('450000'), lastImportAt: '2026-08-23T12:00:00Z' }} />
          <CreditCardCard card={{ id: 'card-1', name: 'Visa Signature', bank: 'BBVA', lastFour: '4321', currency: 'ARS', balance: mockMoney('180000'), creditLimit: mockMoney('500000'), closingDay: 20, dueDay: 28 }} />
        </div>
        <div className="space-y-4">
          <MarketStrip observedAt="2026-08-23T12:00:00Z" quotes={[{ code: 'RIESGO_PAIS', label: 'Riesgo País', value: '742', variation: -12, unit: 'POINTS', observedAt: '2026-08-23T12:00:00Z' }]} />
          <StockBar ticker="GGAL" name="Grupo Financiero Galicia" quantity={150} avgPrice={mockMoney('4200')} currentValue={mockMoney('4850')} pnlPct={15.48} />
          <div className="p-4 border rounded-xl bg-card">
            <PositionForm mode="add" />
          </div>
        </div>
        <div className="space-y-4">
          <Stepper steps={['Cargar archivo', 'Vista previa', 'Confirmación']} current={1} />
          <Dropzone accept=".csv,.pdf" onFile={() => {}} />
          <FileProgress fileName="resumen_agosto.csv" status="uploading" progress={65} />
        </div>
      </section>

      {dirty && <SaveBar isDirty={dirty} onSave={() => setDirty(false)} onDiscard={() => setDirty(false)} />}
    </div>
  )
}
