import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { TickerChartPanel } from '../TickerChartPanel'

const research = vi.hoisted(() => vi.fn())

vi.mock('@/lib/hooks/useInvestments', () => ({ useTickerResearch: research }))
vi.mock('@/components/charts/AreaChart', () => ({ AreaChart: () => <div data-testid="area-chart" /> }))

const NAME = 'Grupo Financiero Galicia S.A. Acciones Ordinarias Escriturales Clase B'

function renderPanel(onBuy = vi.fn()) {
  research.mockReturnValue({
    data: { ticker: 'GGAL', currency: 'ARS', currentPrice: 8120, variation: 1.5, series: [{ date: '2026-09-01', price: 8000 }] },
    isLoading: false,
    isError: false,
  })
  render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      <TickerChartPanel ticker="GGAL" name={NAME} onBuy={onBuy} />
    </NextIntlClientProvider>,
  )
  return screen.getByTestId('ticker-chart-head')
}

describe('TickerChartPanel', () => {
  it('truncates a long name in the header and keeps the full name in its title', () => {
    const head = renderPanel()
    const name = within(head).getByText(NAME)
    expect(name).toHaveClass('truncate')
    expect(name).toHaveAttribute('title', NAME)
  })

  it('labels the range group and marks the selected range', async () => {
    const head = renderPanel()
    const group = within(head).getByRole('group', { name: esAR.investments.market.priceRangeAria })
    const ranges = esAR.investments.market.ranges
    const year = within(group).getByRole('button', { name: ranges.Y1 })
    expect(within(group).getByRole('button', { name: ranges.D90 })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(year)
    expect(year).toHaveAttribute('aria-pressed', 'true')
    expect(research).toHaveBeenLastCalledWith('GGAL', 'Y1')
  })

  it('keeps the full and the compact buy label, each for its layout', async () => {
    const onBuy = vi.fn()
    const head = renderPanel(onBuy)
    const full = within(head).getByText('Registrar compra de GGAL')
    const compact = within(head).getByText('Comprar GGAL')
    expect(full).toHaveClass('short:hidden')
    expect(compact).toHaveClass('hidden', 'short:inline')
    await userEvent.click(full)
    expect(onBuy).toHaveBeenCalledWith('GGAL', 8120, 'ARS')
  })
})
