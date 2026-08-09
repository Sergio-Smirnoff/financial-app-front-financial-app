'use client'

import React from 'react'
import Link from 'next/link'
import { InlineBanner } from '@/components/ui-kit/feedback/InlineBanner'

export interface UncategorisedBannerProps {
  count: number
}

export function UncategorisedBanner({ count }: UncategorisedBannerProps) {
  if (count <= 0) return null

  return (
    <div role="status" aria-label={`${count} movimientos sin categorizar`}>
      <InlineBanner
        tone="warn"
        title="Movimientos sin categorizar"
        description={
          <span>
            Tenés {count} movimientos sin categorizar.{' '}
            <Link href="/transactions?categories=none" className="underline font-medium hover:text-foreground">
              Ver sin categorizar →
            </Link>
          </span>
        }
      />
    </div>
  )
}
