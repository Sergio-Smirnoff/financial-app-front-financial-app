'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { keepsHoldingDraft, useHoldingDraftStore } from '@/lib/store/holdingDraft.store'

export function HoldingDraftReset() {
  const pathname = usePathname()
  const clear = useHoldingDraftStore((state) => state.clear)

  useEffect(() => {
    if (pathname && !keepsHoldingDraft(pathname)) clear()
  }, [pathname, clear])

  return null
}
