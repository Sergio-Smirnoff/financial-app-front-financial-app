import React from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { UpcomingRail, type UpcomingPaymentItem } from '../UpcomingRail'
import type { Section } from '@/lib/api/bff/types'

const NOW = new Date().toISOString()

const payments: UpcomingPaymentItem[] = Array.from({ length: 10 }, (_, index) => ({
  id: String(index + 1),
  kind: 'LOAN',
  label: `Cuota ${index + 1}`,
  dueDate: `2026-${String(index + 1).padStart(2, '0')}-01`,
  amount: { amount: '72550.33', currency: 'ARS', secondary: null },
}))

function layout(listHeight: number, framed: boolean) {
  vi.stubGlobal('matchMedia', (media: string) => ({
    matches: framed,
    media,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
    return this.getAttribute('data-testid') === 'upcoming-list' ? listHeight : 0
  })
  vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(function (this: HTMLElement) {
    return this.parentElement ? Array.from(this.parentElement.children).indexOf(this) * 50 : 0
  })
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return this.hidden ? 0 : 50
  })
}

function renderRail(data: UpcomingPaymentItem[]) {
  const section: Section<UpcomingPaymentItem[]> = { status: 'OK', observedAt: NOW, data }
  render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      <UpcomingRail section={section} isLoading={false} />
    </NextIntlClientProvider>,
  )
}

const shown = () => screen.getAllByTestId('upcoming-row').filter((row) => !row.hidden).length

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('UpcomingRail', () => {
  it('shows only the payments that fully fit in the frame and links to the rest', () => {
    layout(160, true)
    renderRail(payments)
    expect(shown()).toBe(3)
    const more = screen.getByTestId('upcoming-more')
    expect(more).toHaveAttribute('href', '/banks')
    expect(more).toHaveTextContent(esAR.overview.upcomingMore)
    expect(screen.getByTestId('upcoming-list')).toHaveClass('relative', 'min-h-0', 'overflow-hidden')
  })

  it('shows every payment and no link when they all fit', () => {
    layout(1000, true)
    renderRail(payments.slice(0, 4))
    expect(shown()).toBe(4)
    expect(screen.queryByTestId('upcoming-more')).not.toBeInTheDocument()
  })

  it('keeps its heading visible at one height even when no payment fits', () => {
    layout(20, true)
    renderRail(payments)
    expect(shown()).toBe(0)
    const heading = screen.getByRole('heading', { name: esAR.overview.upcomingTitle })
    expect(heading).not.toHaveClass('sr-only')
    expect(heading.parentElement).toHaveClass('h-5', 'shrink-0')
  })

  it('caps the list below the frame and links to the rest', () => {
    layout(0, false)
    renderRail(payments)
    expect(shown()).toBe(6)
    expect(screen.getByTestId('upcoming-more')).toBeInTheDocument()
  })
})
