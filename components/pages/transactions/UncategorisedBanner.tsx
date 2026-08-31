'use client'

import React from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { InlineBanner } from '@/components/ui-kit/feedback/InlineBanner'

export interface UncategorisedBannerProps {
  count: number
}

export function UncategorisedBanner({ count }: UncategorisedBannerProps) {
  const t = useTranslations('transactions')

  if (count <= 0) return null

  return (
    <div role="status" aria-label={t('uncategorised', { count })}>
      <InlineBanner
        tone="warn"
        title={t('uncategorisedTitle')}
        description={
          <span>
            {t('uncategorisedBody', { count })}{' '}
            <Link href="/transactions?categories=none" className="underline font-medium hover:text-foreground">
              {t('uncategorisedLink')}
            </Link>
          </span>
        }
      />
    </div>
  )
}
