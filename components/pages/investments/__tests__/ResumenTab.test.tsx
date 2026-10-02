import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { ResumenTab } from '../ResumenTab'
import { stubChartSize } from '@/test/chartSize'
import type { AssetTypeSlice, InvestmentsKpis, Section } from '@/lib/api/bff/types'

const observedAt = '2026-09-29T10:00:00Z'
const ars = (amount: string) => ({ amount, currency: 'ARS', secondary: null })
const ok = <T,>(data: T): Section<T> => ({ status: 'OK', observedAt, data })

const kpis: InvestmentsKpis = {
  marketValue: ars('10000000'),
  cost: ars('9000000'),
  pnl: ars('1000000'),
  pnlPct: 11.11,
}

const slices: AssetTypeSlice[] = [
  { label: 'STOCK', assetType: 'STOCK', amount: ars('250000'), cost: ars('300000'), pnl: ars('-50000'), pnlPct: -16.67, pct: 2.5, count: 4 },
  { label: 'BOND', assetType: 'BOND', amount: ars('4530000'), cost: ars('4000000'), pnl: ars('530000'), pnlPct: 13.25, pct: 45.3, count: 2 },
  { label: 'CEDEAR', assetType: 'CEDEAR', amount: ars('5220000'), cost: ars('4700000'), pnl: ars('520000'), pnlPct: 11.06, pct: 52.2, count: 14 },
]

function renderResumen(override: Partial<React.ComponentProps<typeof ResumenTab>> = {}) {
  const onRangeChange = vi.fn()
  render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      <ResumenTab
        composition={ok(slices)}
        kpis={kpis}
        evolution={ok([])}
        alerts={ok([])}
        range="1M"
        onRangeChange={onRangeChange}
        isLoading={false}
        {...override}
      />
    </NextIntlClientProvider>,
  )
  return { onRangeChange }
}

describe('ResumenTab', () => {
  beforeEach(() => stubChartSize(320, 240))
  afterEach(() => vi.unstubAllGlobals())

  it('lists every type in fixed order with count, share and P&L from the slices', () => {
    renderResumen()
    const rows = screen.getAllByTestId('composition-row')
    expect(rows.map((r) => r.getAttribute('data-asset-type'))).toEqual(['BOND', 'CEDEAR', 'STOCK'])
    expect(within(rows[0]).getByText('Bonos')).toBeInTheDocument()
    expect(within(rows[0]).getByText('2')).toBeInTheDocument()
    expect(within(rows[0]).getByText('45,3 %')).toBeInTheDocument()
    expect(within(rows[2]).getByText(/−?-?16,67 %/)).toBeInTheDocument()
    expect(screen.getByText('20 posiciones')).toBeInTheDocument()
  })

  it('draws a single type as a full ring', () => {
    renderResumen({ composition: ok([{ ...slices[1], pct: 100 }]) })
    expect(screen.getAllByTestId('composition-row')).toHaveLength(1)
    const card = screen.getByTestId('composition-card')
    expect(card.querySelectorAll('[data-role="slice"]')).toHaveLength(1)
    expect(card.querySelector('[data-role="slice-label"]')!.textContent).toBe('100,0\u00a0%Bonos')
  })

  it('shows the empty state when there is nothing to compose', () => {
    renderResumen({ composition: ok([]) })
    expect(screen.getByTestId('composition-empty')).toBeInTheDocument()
    expect(screen.getByTestId('composition-card').querySelector('[data-role="slice"]')).toBeNull()
  })

  it('keeps the range selector when there is no history and reports a new range', async () => {
    const user = userEvent.setup()
    const { onRangeChange } = renderResumen()
    const card = screen.getByTestId('evolution-card')
    expect(within(card).getByRole('button', { name: '1M' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(card).getByTestId('evolution-empty')).toBeInTheDocument()
    await user.click(within(card).getByRole('button', { name: '3M' }))
    expect(onRangeChange).toHaveBeenCalledWith('3M')
  })

  it('shows the notifications inside Resumen as whole rows, never a scrolling list', () => {
    renderResumen({ alerts: ok([{ id: 1, title: 'YPFD', message: 'superó tu alerta', read: false }]) })
    expect(screen.getByTestId('alert-row')).toHaveTextContent('YPFD')
    expect(screen.getByTestId('alerts-list')).toHaveClass('relative', 'min-h-0', 'overflow-hidden')
  })

  it('keeps the composition table inside its card: no scroller, P&L $ dropped at 1440px, no table when short', () => {
    renderResumen()
    const card = screen.getByTestId('composition-card')
    expect(card.querySelector('.overflow-x-auto')).toBeNull()
    expect(screen.getByRole('columnheader', { name: esAR.investments.composition.colPnl })).toHaveClass('max-[1441px]:hidden')
    expect(screen.getByRole('columnheader', { name: esAR.investments.composition.colPnlPct })).not.toHaveClass('max-[1441px]:hidden')
    expect(screen.getByRole('table', { name: esAR.investments.composition.heading })).toHaveClass('short:hidden')
  })

  it('contains the table caption inside the card so it never stretches the page', () => {
    renderResumen()
    expect(screen.getByTestId('composition-card')).toHaveClass('relative')
  })

  it('heads Evolución with the portfolio value on one line', () => {
    renderResumen()
    const card = screen.getByTestId('evolution-card')
    expect(card.querySelector('[data-amount]')).toHaveTextContent(/10\.000\.000,00/)
    expect(within(card).getByText('+11,11 %')).toBeInTheDocument()
  })

  it('shows the composition error state when unavailable', () => {
    renderResumen({ composition: { status: 'UNAVAILABLE', observedAt, data: null } as Section<AssetTypeSlice[]> })
    const card = screen.getByTestId('composition-card')
    expect(within(card).getByText(esAR.sections.unavailable)).toBeInTheDocument()
    expect(card.querySelector('[data-role="slice"]')).toBeNull()
    expect(screen.queryAllByTestId('composition-row')).toHaveLength(0)
    expect(document.body.textContent).not.toContain('NaN')
  })
})
