import React from 'react'
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFitCount } from '../useFitCount'

function List({ rows, height }: { rows: number; height: number }) {
  const { ref, count, framed } = useFitCount<HTMLUListElement>(rows)
  return (
    <>
      <ul ref={ref} data-box-height={height}>
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} data-top={i * 40} data-row-height={40} hidden={i >= count}>
            row {i}
          </li>
        ))}
      </ul>
      <output data-testid="fit">{`${count}/${framed}`}</output>
    </>
  )
}

function stubFrame(matches: boolean) {
  vi.stubGlobal('matchMedia', (media: string) => ({
    matches,
    media,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

const visibleRows = () => screen.getAllByRole('listitem', { hidden: true }).filter((row) => !row.hidden)

describe('useFitCount', () => {
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'clientHeight', 'get').mockImplementation(function (this: Element) {
      return Number(this.getAttribute('data-box-height') ?? 0)
    })
    vi.spyOn(HTMLElement.prototype, 'offsetTop', 'get').mockImplementation(function (this: HTMLElement) {
      return Number(this.dataset.top ?? 0)
    })
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return Number(this.dataset.rowHeight ?? 0)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('shows only the rows that fully fit inside a framed list', () => {
    stubFrame(true)
    render(<List rows={9} height={130} />)
    expect(screen.getByTestId('fit')).toHaveTextContent('3/true')
    expect(visibleRows()).toHaveLength(3)
  })

  it('shows no row when not even one fits, so the caller can show its link', () => {
    stubFrame(true)
    render(<List rows={9} height={30} />)
    expect(screen.getByTestId('fit')).toHaveTextContent('0/true')
    expect(visibleRows()).toHaveLength(0)
  })

  it('shows the first six rows when the page is not framed', () => {
    stubFrame(false)
    render(<List rows={9} height={130} />)
    expect(screen.getByTestId('fit')).toHaveTextContent('6/false')
    expect(visibleRows()).toHaveLength(6)
  })

  it('measures again when the list is resized', () => {
    stubFrame(true)
    let notify = () => {}
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          notify = () => callback([], this as unknown as ResizeObserver)
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
    render(<List rows={9} height={130} />)

    screen.getAllByRole('listitem', { hidden: true })[0].parentElement!.setAttribute('data-box-height', '250')
    act(() => notify())

    expect(screen.getByTestId('fit')).toHaveTextContent('6/true')
    expect(visibleRows()).toHaveLength(6)
  })
})
