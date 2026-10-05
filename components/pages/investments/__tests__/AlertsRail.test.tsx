import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import type { Section } from '@/lib/api/bff/types'
import { AlertsRail, type AlertRow } from '../AlertsRail'

vi.mock('@/lib/hooks/useFitCount', () => ({
  useFitCount: () => ({ ref: () => undefined, count: 0, framed: true }),
}))

const observedAt = '2026-09-29T10:00:00Z'

function renderRail(section: Section<AlertRow[]>) {
  render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      <AlertsRail section={section} isLoading={false} />
    </NextIntlClientProvider>,
  )
  return screen.getByTestId('alerts-card')
}

describe('AlertsRail', () => {
  it('hides the heading visually when no framed row fits', () => {
    const card = renderRail({ status: 'OK', observedAt, data: [{ id: 1, title: 'YPFD', message: 'alerta', read: false }] })
    expect(within(card).getByRole('heading', { name: esAR.investments.alerts.title })).toHaveClass('sr-only')
    expect(within(card).getByTestId('alerts-hidden')).toBeInTheDocument()
  })

  it('keeps the heading visible over the empty state with a stale zero fit count', () => {
    const card = renderRail({ status: 'OK', observedAt, data: [] })
    expect(within(card).getByRole('heading', { name: esAR.investments.alerts.title })).not.toHaveClass('sr-only')
    expect(within(card).getByText(esAR.investments.alerts.empty)).toBeInTheDocument()
  })

  it('keeps the heading visible over the unavailable state with a stale zero fit count', () => {
    const card = renderRail({ status: 'UNAVAILABLE', observedAt, data: null } as Section<AlertRow[]>)
    expect(within(card).getByRole('heading', { name: esAR.investments.alerts.title })).not.toHaveClass('sr-only')
  })
})
