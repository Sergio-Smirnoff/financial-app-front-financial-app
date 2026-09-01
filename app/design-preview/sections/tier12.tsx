'use client'

import { useState } from 'react'
import { Money } from '@/components/ui-kit/money/Money'
import { DeltaBadge } from '@/components/ui-kit/money/DeltaBadge'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { InlineBanner } from '@/components/ui-kit/feedback/InlineBanner'
import { Toast } from '@/components/ui-kit/feedback/Toast'
import { KpiTile, KpiStrip, RailSection, SplitLayout } from '@/components/ui-kit/layout/KpiStrip'
import { FilterBar, FilterChip, RowActions } from '@/components/ui-kit/controls/FilterBar'
import { SidePanel } from '@/components/ui-kit/overlay/SidePanel'
import { Dialog } from '@/components/ui-kit/overlay/Dialog'
import { Button } from '@/components/ui/button'

const DEMO_MONEY = { amount: '1250000', currency: 'ARS' as const, secondary: null }
const DEMO_MONEY_USD = {
  amount: '1000',
  currency: 'USD' as const,
  secondary: { amount: '1190000', currency: 'ARS' as const, secondary: null },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="section-head">{title}</h2>
      <div className="fade-rule mb-4" />
      {children}
    </section>
  )
}

export default function Tier12Section() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [chips, setChips] = useState(['ARS', 'Efectivo'])

  return (
    <div className="space-y-12">
      {/* ------------------------------------------------------------------ */}
      <Section title="Money — todas las variantes">
        <div className="flex flex-wrap gap-6 items-center">
          <div>
            <p className="kicker mb-1">neutral</p>
            <Money value={DEMO_MONEY} />
          </div>
          <div>
            <p className="kicker mb-1">gain</p>
            <Money value={DEMO_MONEY} tone="gain" />
          </div>
          <div>
            <p className="kicker mb-1">loss</p>
            <Money value={{ amount: '-500', currency: 'ARS', secondary: null }} tone="loss" />
          </div>
          <div>
            <p className="kicker mb-1">con secundario USD→ARS</p>
            <Money value={DEMO_MONEY_USD} />
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section title="DeltaBadge">
        <div className="flex gap-4 items-center">
          <DeltaBadge pct={5.2} />
          <DeltaBadge pct={-3.1} />
          <DeltaBadge pct={0} />
          <DeltaBadge pct={12.5} absolute={DEMO_MONEY_USD} />
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section title="SectionState — los cuatro estados">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="kicker mb-2">loading</p>
            <SectionState section={undefined} isLoading skeleton={<div className="h-16 rounded-lg bg-muted animate-pulse" />} onRetry={() => {}}>
              {() => null}
            </SectionState>
          </div>
          <div>
            <p className="kicker mb-2">unavailable</p>
            <SectionState section={{ status: 'UNAVAILABLE', observedAt: new Date().toISOString(), data: null }} isLoading={false} skeleton={null} onRetry={() => alert('retry')}>
              {() => null}
            </SectionState>
          </div>
          <div>
            <p className="kicker mb-2">empty</p>
            <SectionState section={{ status: 'OK', observedAt: new Date().toISOString(), data: [] }} isLoading={false} skeleton={null} emptyAction={<Button size="sm">Agregar</Button>} onRetry={() => {}}>
              {() => null}
            </SectionState>
          </div>
          <div>
            <p className="kicker mb-2">ready</p>
            <SectionState section={{ status: 'OK', observedAt: new Date().toISOString(), data: [1] }} isLoading={false} skeleton={null} onRetry={() => {}}>
              {(data) => <p className="text-sm">fila {data[0]}</p>}
            </SectionState>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section title="InlineBanner + Toast">
        <div className="space-y-3">
          <InlineBanner tone="info" title="Información" description="Este es un banner informativo." />
          <InlineBanner tone="warn" description="Atención: puede haber un problema." />
          <InlineBanner tone="error" title="Error" description="No se pudo completar la operación." onClose={() => {}} />
          <InlineBanner tone="success" description="Operación completada correctamente." />
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <Toast tone="info" title="Info" description="Mensaje informativo" onClose={() => {}} />
          <Toast tone="error" description="Error al procesar" onClose={() => {}} />
          <Toast tone="success" title="Listo" description="Guardado correctamente" />
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section title="KpiStrip">
        <KpiStrip>
          <KpiTile label="Saldo total" value={<Money value={DEMO_MONEY} />} delta={<DeltaBadge pct={2.4} />} />
          <KpiTile label="Inversiones" value={<Money value={DEMO_MONEY_USD} />} delta={<DeltaBadge pct={-0.8} />} />
          <KpiTile label="Gastos del mes" value={<Money value={{ amount: '85000', currency: 'ARS', secondary: null }} tone="loss" />} />
          <KpiTile label="Ingresos" value={<Money value={{ amount: '200000', currency: 'ARS', secondary: null }} tone="gain" />} hint="Estimado neto" />
        </KpiStrip>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section title="FilterBar + FilterChip">
        <FilterBar onClear={() => setChips([])}>
          {chips.map((chip) => (
            <FilterChip key={chip} label={chip} onRemove={() => setChips((c) => c.filter((x) => x !== chip))} />
          ))}
        </FilterBar>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section title="RowActions">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Fila de ejemplo →</span>
          <RowActions
            items={[
              { label: 'Editar', onSelect: () => {} },
              { label: 'Duplicar', onSelect: () => {} },
              { label: 'Eliminar', onSelect: () => {}, tone: 'destructive' },
            ]}
          />
        </div>
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section title="SplitLayout">
        <SplitLayout
          main={
            <div className="elev-sm rounded-lg bg-card p-6">
              <p className="section-head mb-2">Contenido principal</p>
              <p className="text-sm text-muted-foreground">Tab order: este bloque va primero en el DOM.</p>
            </div>
          }
          rail={
            <RailSection title="Rail derecho">
              <p className="text-sm text-muted-foreground">Resumen lateral. En el DOM viene después del main.</p>
            </RailSection>
          }
        />
      </Section>

      {/* ------------------------------------------------------------------ */}
      <Section title="SidePanel + Dialog">
        <div className="flex gap-4">
          <Button onClick={() => setPanelOpen(true)}>Abrir SidePanel</Button>
          <Button variant="outline" onClick={() => setDialogOpen(true)}>Abrir Dialog</Button>
        </div>
        <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} title="Panel lateral">
          <p className="text-sm text-muted-foreground">Contenido del panel. Escape cierra y devuelve el foco.</p>
        </SidePanel>
        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          title="Confirmar acción"
          description="Esta acción no se puede deshacer. ¿Querés continuar?"
        >
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => setDialogOpen(false)}>Confirmar</Button>
          </div>
        </Dialog>
      </Section>
    </div>
  )
}
