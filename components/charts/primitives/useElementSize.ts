import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

export function useElementSize<T extends HTMLElement>(): [RefObject<T | null>, { width: number; height: number }] {
  const ref = useRef<T>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const update = (width: number, height: number) => {
      const next = { width: Math.floor(width), height: Math.floor(height) }
      setSize((prev) => (prev.width === next.width && prev.height === next.height ? prev : next))
    }

    update(element.clientWidth, element.clientHeight)
    const observer = new ResizeObserver(([entry]) => {
      if (entry) update(entry.contentRect.width, entry.contentRect.height)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return [ref, size]
}
