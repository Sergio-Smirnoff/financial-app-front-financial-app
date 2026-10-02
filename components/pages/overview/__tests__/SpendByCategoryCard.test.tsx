import React from 'react'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { NextIntlClientProvider } from 'next-intl'
import esAR from '@/messages/es-AR.json'
import { SpendByCategoryCard } from '../SpendByCategoryCard'
import type { SpendCategoryItem } from '../SpendByCategoryCard'
import type { Section } from '@/lib/api/bff/types'

const NOW = new Date().toISOString()

function renderCard(data: SpendCategoryItem[]) {
  const section: Section<SpendCategoryItem[]> = { status: 'OK', observedAt: NOW, data }
  return render(
    <NextIntlClientProvider locale="es-AR" messages={esAR}>
      <SpendByCategoryCard section={section} isLoading={false} />
    </NextIntlClientProvider>
  )
}

describe('SpendByCategoryCard', () => {
  it('shows each category as amount · share, without a cap', () => {
    const { container } = renderCard([
      { categoryId: 1, name: 'expensas', amount: { amount: '87000000', currency: 'ARS' }, pct: 98.7 },
      { categoryId: 2, name: 'Inversiones', amount: { amount: '1119611.57', currency: 'ARS' }, pct: 1.3 },
    ])
    expect(screen.getByText(/87\.000\.000 · 98,7\s%/)).toBeInTheDocument()
    expect(screen.getByText(/1\.119\.612 · 1,3\s%/)).toBeInTheDocument()
    expect(container).not.toHaveTextContent(' / ')
  })

  it('shows the primary amount only, never the secondary currency', () => {
    renderCard([
      {
        categoryId: 1,
        name: 'Comida',
        amount: { amount: '85000', currency: 'ARS', secondary: { amount: '70', currency: 'USD' } },
        pct: 36.9,
      },
    ])
    expect(screen.getByText(/85\.000 · 36,9\s%/)).toBeInTheDocument()
    expect(screen.queryByText(/US\$/)).not.toBeInTheDocument()
  })

  it('treats a missing share as zero instead of inventing a cap', () => {
    renderCard([{ categoryId: 3, name: 'Otros', amount: { amount: '100', currency: 'ARS' } }])
    expect(screen.getByText(/100 · 0,0\s%/)).toBeInTheDocument()
  })
})

describe('SpendByCategoryCard as a fit list', () => {
  const categories: SpendCategoryItem[] = [
    { categoryId: 1, name: 'Ocio', amount: { amount: '5000', currency: 'ARS' }, pct: 5 },
    { categoryId: 2, name: 'Expensas', amount: { amount: '40000', currency: 'ARS' }, pct: 40 },
    { categoryId: 3, name: 'Comida', amount: { amount: '25000', currency: 'ARS' }, pct: 25 },
    { categoryId: 4, name: 'Transporte', amount: { amount: '15000', currency: 'ARS' }, pct: 15 },
    { categoryId: 5, name: 'Salud', amount: { amount: '10000', currency: 'ARS' }, pct: 10 },
    { categoryId: 6, name: 'Regalos', amount: { amount: '5000', currency: 'ARS' }, pct: 4.9 },
    { categoryId: 7, name: 'Mascotas', amount: { amount: '100', currency: 'ARS' }, pct: 0.1 },
  ]

  function layout(listHeight: number, framed: boolean) {
    vi.stubGlobal('matchMedia', (media: string) => ({
      matches: framed,
      media,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
      return this.getAttribute('data-testid') === 'spend-list' ? listHeight : 0
    })
    vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(function (this: HTMLElement) {
      return this.parentElement ? Array.from(this.parentElement.children).indexOf(this) * 40 : 0
    })
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return this.hidden ? 0 : 40
    })
  }

  const shownNames = () =>
    screen
      .getAllByTestId('spend-row')
      .filter((row) => !row.hidden)
      .map((row) => row.getAttribute('data-name'))

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows only the largest categories that fully fit, and links to the rest', () => {
    layout(130, true)
    renderCard(categories)
    expect(shownNames()).toEqual(['Expensas', 'Comida', 'Transporte'])
    const more = screen.getByTestId('spend-more')
    expect(more).toHaveAttribute('href', '/categories')
    expect(more).toHaveTextContent(esAR.overview.spendMore)
    expect(screen.getByTestId('spend-list')).toHaveClass('relative', 'min-h-0', 'overflow-hidden')
  })

  it('shows only the link when not one category fits, keeping the heading for screen readers', () => {
    layout(30, true)
    renderCard(categories)
    expect(shownNames()).toEqual([])
    expect(screen.getByTestId('spend-more')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: esAR.overview.spendTitle })).toHaveClass('sr-only')
  })

  it.each([
    ['none fit', 30],
    ['some fit', 130],
    ['all fit', 1000],
  ])('keeps the header the same height when %s', (_, listHeight) => {
    layout(listHeight, true)
    renderCard(categories)
    const heading = screen.getByRole('heading', { name: esAR.overview.spendTitle })
    expect(heading.parentElement).toHaveClass('h-5', 'shrink-0')
  })

  it('shows the heading visibly while at least one category fits', () => {
    layout(130, true)
    renderCard(categories)
    expect(screen.getByRole('heading', { name: esAR.overview.spendTitle })).not.toHaveClass('sr-only')
  })

  it('shows every category and no link when they all fit', () => {
    layout(1000, true)
    renderCard(categories)
    expect(shownNames()).toHaveLength(7)
    expect(screen.queryByTestId('spend-more')).not.toBeInTheDocument()
    expect(screen.getByText(esAR.overview.spendTitle)).toBeInTheDocument()
  })

  it('shows the first six largest categories when the page is not framed', () => {
    layout(130, false)
    renderCard(categories)
    expect(shownNames()).toEqual(['Expensas', 'Comida', 'Transporte', 'Salud', 'Ocio', 'Regalos'])
    expect(screen.getByTestId('spend-more')).toBeInTheDocument()
  })
})
