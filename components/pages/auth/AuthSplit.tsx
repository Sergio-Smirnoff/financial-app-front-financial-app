'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

export interface AuthSplitProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function AuthSplit({ children, title, subtitle }: AuthSplitProps) {
  const t = useTranslations('auth')

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between bg-primary p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70 z-0" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center font-bold text-lg">
              F
            </div>
            <span className="font-bold text-xl tracking-tight">financial-app</span>
          </div>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">{title ?? t('split.defaultTitle')}</h2>
          <p className="text-primary-foreground/80 text-base">{subtitle ?? t('split.defaultSubtitle')}</p>
        </div>

        <div className="relative z-10 text-xs text-primary-foreground/60">
          {t('split.footer')}
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">{children}</div>
      </div>
    </div>
  )
}
