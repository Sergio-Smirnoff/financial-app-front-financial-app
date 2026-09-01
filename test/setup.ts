import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll } from 'vitest'

// cmdk and Radix primitives use ResizeObserver which jsdom doesn't implement
beforeAll(() => {
  if (typeof window.ResizeObserver === 'undefined') {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
  // cmdk calls scrollIntoView on list items
  if (typeof window.HTMLElement.prototype.scrollIntoView === 'undefined') {
    window.HTMLElement.prototype.scrollIntoView = function () {}
  }
})

afterEach(cleanup)

