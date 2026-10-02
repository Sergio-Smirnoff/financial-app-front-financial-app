import { vi } from 'vitest'

export function stubChartSize(width: number, height: number): void {
  class FixedSizeResizeObserver implements ResizeObserver {
    constructor(private readonly callback: ResizeObserverCallback) {}

    observe(target: Element) {
      const entry = { target, contentRect: { width, height } } as unknown as ResizeObserverEntry
      this.callback([entry], this)
    }

    unobserve() {}

    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', FixedSizeResizeObserver)
}
