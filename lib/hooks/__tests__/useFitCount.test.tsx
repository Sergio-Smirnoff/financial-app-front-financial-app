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

function LateList({ rows, mounted }: { rows: number; mounted: boolean }) {
  const { ref, count } = useFitCount<HTMLUListElement>(rows)
  return (
    <>
      {mounted && (
        <ul ref={ref} data-box-height={130}>
          {Array.from({ length: rows }, (_, i) => (
            <li key={i} data-top={i * 40} data-row-height={40} hidden={i >= count}>
              row {i}
            </li>
          ))}
        </ul>
      )}
      <output data-testid="fit">{count}</output>
    </>
  )
}

const frame = { matches: false, listeners: new Set<() => void>() }

function stubFrame(matches: boolean) {
  frame.matches = matches
  frame.listeners.clear()
  vi.stubGlobal('matchMedia', (media: string) => ({
    get matches() {
      return frame.matches
    },
    media,
    addEventListener: (_type: string, listener: () => void) => frame.listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => frame.listeners.delete(listener),
  }))
}

function stubResizeObserver() {
  const observer = { notify: () => {}, disconnected: 0 }
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        observer.notify = () => callback([], this as unknown as ResizeObserver)
      }
      observe() {}
      unobserve() {}
      disconnect() {
        observer.disconnected += 1
      }
    },
  )
  return observer
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
      return this.hidden ? 0 : Number(this.dataset.rowHeight ?? 0)
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
    const observer = stubResizeObserver()
    render(<List rows={9} height={130} />)

    screen.getAllByRole('listitem', { hidden: true })[0].parentElement!.setAttribute('data-box-height', '250')
    act(() => observer.notify())

    expect(screen.getByTestId('fit')).toHaveTextContent('6/true')
    expect(visibleRows()).toHaveLength(6)
  })

  it('measures hidden rows at full height and leaves them hidden afterwards', () => {
    stubFrame(true)
    const observer = stubResizeObserver()
    render(<List rows={9} height={130} />)
    expect(visibleRows()).toHaveLength(3)

    screen.getAllByRole('listitem', { hidden: true })[0].parentElement!.setAttribute('data-box-height', '210')
    act(() => observer.notify())

    expect(screen.getByTestId('fit')).toHaveTextContent('5/true')
    const rows = screen.getAllByRole('listitem', { hidden: true })
    expect(rows.map((row) => row.hidden)).toEqual([false, false, false, false, false, true, true, true, true])
  })

  it('measures again when the page crosses the frame breakpoint at the same list size', () => {
    stubFrame(false)
    stubResizeObserver()
    render(<List rows={9} height={130} />)
    expect(screen.getByTestId('fit')).toHaveTextContent('6/false')

    frame.matches = true
    act(() => frame.listeners.forEach((listener) => listener()))

    expect(screen.getByTestId('fit')).toHaveTextContent('3/true')
  })

  it('measures a list that mounts after the hook', () => {
    stubFrame(true)
    stubResizeObserver()
    const { rerender } = render(<LateList rows={9} mounted={false} />)
    rerender(<LateList rows={9} mounted />)
    expect(screen.getByTestId('fit')).toHaveTextContent('3')
  })

  it('stops observing on unmount', () => {
    stubFrame(true)
    const observer = stubResizeObserver()
    const { unmount } = render(<List rows={9} height={130} />)
    expect(frame.listeners.size).toBe(1)
    unmount()
    expect(observer.disconnected).toBeGreaterThan(0)
    expect(frame.listeners.size).toBe(0)
  })
})
