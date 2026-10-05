import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CardHeader } from '../CardHeader'

describe('CardHeader', () => {
  it('keeps the title on one line at a fixed height and its full text in the title', () => {
    render(<CardHeader title="Gastos por categoría" action={<a href="/categories">Ver categorías →</a>} />)
    const heading = screen.getByRole('heading', { name: 'Gastos por categoría' })
    expect(heading).toHaveClass('min-w-0', 'truncate')
    expect(heading).toHaveAttribute('title', 'Gastos por categoría')
    expect(heading.parentElement).toHaveClass('h-5', 'shrink-0')
  })

  it('never lets the action shrink or wrap', () => {
    render(<CardHeader title="Próximos vencimientos" action={<a href="/banks">Ver todos →</a>} />)
    expect(screen.getByRole('link', { name: 'Ver todos →' }).parentElement).toHaveClass('shrink-0', 'whitespace-nowrap')
  })

  it('hides the title visually only when asked, and renders no action box without an action', () => {
    const { container } = render(<CardHeader title="Últimos movimientos" titleHidden action={false} />)
    expect(screen.getByRole('heading', { name: 'Últimos movimientos' })).toHaveClass('sr-only')
    expect(container.firstElementChild?.children).toHaveLength(1)
  })
})
