import React from 'react'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FRAME_QUERY, SHORT_QUERY } from '@/lib/layout/frame'
import { PageFrame, PageFrameFill } from '../PageFrame'

describe('PageFrame', () => {
  it('renders the page main landmark, marked as the frame', () => {
    render(
      <PageFrame>
        <h1>Resumen</h1>
      </PageFrame>
    )
    expect(screen.getByRole('main')).toHaveAttribute('data-page-frame')
  })

  it('scrolls by default and hides overflow only inside the frame variant', () => {
    render(<PageFrame>x</PageFrame>)
    const main = screen.getByRole('main')
    expect(main).toHaveClass('h-full', 'overflow-auto', 'p-6', 'frame:overflow-hidden')
    expect(main).not.toHaveClass('overflow-hidden')
  })

  it('is the named container the content-width layouts query', () => {
    render(<PageFrame>x</PageFrame>)
    expect(screen.getByRole('main')).toHaveClass('@container/page')
  })

  it('keeps stacked boxes 18px apart on phones and tightens in the compact frame', () => {
    render(<PageFrame>x</PageFrame>)
    expect(screen.getByRole('main')).toHaveClass('max-md:gap-4.5', 'max-md:p-4', 'short:gap-3', 'short:px-5', 'short:py-3.5')
  })

  it('lets one row take the remaining height inside the frame', () => {
    render(
      <PageFrame>
        <PageFrameFill className="grid">
          <span>fill</span>
        </PageFrameFill>
      </PageFrame>
    )
    expect(screen.getByText('fill').parentElement).toHaveClass('frame:flex-1', 'frame:min-h-0', 'grid')
  })

  it('declares the frame and short variants from the shared queries', () => {
    const css = readFileSync(path.resolve(__dirname, '../../../../app/globals.css'), 'utf8')
    expect(FRAME_QUERY).toBe('(min-width: 1280px) and (min-height: 600px)')
    expect(SHORT_QUERY).toBe(`${FRAME_QUERY} and (max-height: 759.98px)`)
    expect(css).toContain(`@custom-variant frame (@media ${FRAME_QUERY});`)
    expect(css).toContain(`@custom-variant short (@media ${SHORT_QUERY});`)
  })
})
