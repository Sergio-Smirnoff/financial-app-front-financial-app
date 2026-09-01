'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import type { components } from '@/lib/api/bff/schema'

type SectionResponseUserProfileResponse = components['schemas']['SectionResponseUserProfileResponse']

export interface ProfileSectionProps {
  section?: SectionResponseUserProfileResponse | any
  isLoading: boolean
  onRetry?: () => void
  nameValue: string
  onNameChange: (val: string) => void
}

export function ProfileSection({
  section,
  isLoading,
  onRetry,
  nameValue,
  onNameChange,
}: ProfileSectionProps) {
  const t = useTranslations('settings')

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-32 rounded-xl bg-muted animate-pulse" />}
    >
      {(profile: any) => (
        <div id="profile" className="elev-sm rounded-xl border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="section-head">{t('profile.title')}</h3>
            {profile.email && (
              <span className="text-xs text-muted-foreground font-mono">
                {profile.email}
              </span>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="email-input" className="text-sm font-medium">
                {t('profile.email')}
              </label>
              <Input id="email-input" value={profile.email ?? ''} disabled className="bg-muted" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="name-input" className="text-sm font-medium">
                {t('profile.name')}
              </label>
              <Input
                id="name-input"
                value={nameValue}
                onChange={(e) => onNameChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </SectionState>
  )
}
