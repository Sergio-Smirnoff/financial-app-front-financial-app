import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { TickerSearchBox } from '../TickerSearchBox'

vi.mock('@/lib/hooks/useInvestments', () => ({
  useTickerSearch: () => ({
    data: [{ ticker: 'GGAL', name: 'Grupo Financiero Galicia', price: 8120, currency: 'ARS', variation: 1.5 }],
    isLoading: false,
  }),
}))

function rect(top: number, bottom: number): DOMRect {
  return { top, bottom, left: 0, right: 0, width: 0, height: bottom - top, x: 0, y: top, toJSON: () => ({}) }
}

function renderInFrame(frameBottom: number, fieldBottom: number) {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    if (this.hasAttribute('data-page-frame')) return rect(56, frameBottom)
    return rect(fieldBottom - 44, fieldBottom)
  })
  render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      <main data-page-frame>
        <TickerSearchBox onSelect={vi.fn()} />
      </main>
    </NextIntlClientProvider>,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('TickerSearchBox', () => {
  it('caps the results to the room left above the bottom of the page frame', async () => {
    renderInFrame(600, 280)
    await userEvent.type(screen.getByPlaceholderText(esAR.investments.market.searchPlaceholder), 'G')
    expect(screen.getByTestId('ticker-search-results')).toHaveStyle({ maxHeight: '306px' })
  })

  it('never grows the results past 320px on a tall frame', async () => {
    renderInFrame(1313, 280)
    await userEvent.type(screen.getByPlaceholderText(esAR.investments.market.searchPlaceholder), 'G')
    expect(screen.getByTestId('ticker-search-results')).toHaveStyle({ maxHeight: '320px' })
  })
})
