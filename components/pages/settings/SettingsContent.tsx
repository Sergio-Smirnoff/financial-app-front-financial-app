'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSettingsPage } from '@/lib/hooks/useSettingsPage'
import { ProfileSection } from './ProfileSection'
import { SecuritySection } from './SecuritySection'
import { CurrencyFormatSection } from './CurrencyFormatSection'
import { NotificationsSection } from './NotificationsSection'
import { FeesSection } from './FeesSection'
import { DataSection } from './DataSection'
import { SaveBar } from '@/components/ui-kit/controls/Toolbar'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { BffQuery, SettingsBff } from '@/lib/api/bff/types'

export interface SettingsContentProps {
  query?: BffQuery
  initialData?: SettingsBff
}

export function SettingsContent({ query }: SettingsContentProps) {
  const t = useTranslations('settings')
  const queryClient = useQueryClient()
  const { data, isLoading, refetch } = useSettingsPage()

  const profile = data?.profile
  const preferences = data?.preferences
  const fees = data?.fees
  const notificationPrefs = data?.notificationPrefs
  const sessions = data?.sessions

  const initialName = profile?.data?.name ?? 'Ana Pérez'
  const initialPrimaryCurrency = preferences?.data?.primaryCurrency ?? 'ARS'
  const initialSecondaryCurrency = preferences?.data?.secondaryCurrency ?? 'none'
  const initialDecimals = String(preferences?.data?.decimals ?? '2')
  const initialUseColors = preferences?.data?.useGainLossColors ?? true

  const [nameValue, setNameValue] = useState(initialName)
  const [primaryCurrency, setPrimaryCurrency] = useState(initialPrimaryCurrency)
  const [secondaryCurrency, setSecondaryCurrency] = useState(initialSecondaryCurrency)
  const [decimals, setDecimals] = useState(initialDecimals)
  const [useColors, setUseColors] = useState(initialUseColors)

  useEffect(() => {
    if (profile?.data?.name) {
      setNameValue(profile.data.name)
    }
  }, [profile?.data?.name])

  useEffect(() => {
    if (preferences?.data) {
      if (preferences.data.primaryCurrency) {
        setPrimaryCurrency(preferences.data.primaryCurrency)
      }
      setSecondaryCurrency(preferences.data.secondaryCurrency ?? 'none')
      setDecimals(String(preferences.data.decimals ?? '2'))
      setUseColors(preferences.data.useGainLossColors ?? true)
    }
  }, [preferences?.data])

  const isDirty =
    nameValue !== initialName ||
    primaryCurrency !== initialPrimaryCurrency ||
    secondaryCurrency !== initialSecondaryCurrency ||
    decimals !== initialDecimals ||
    useColors !== initialUseColors

  const handleSave = async () => {
    try {
      await api.put('/api/v1/users/me/preferences', {
        primaryCurrency,
        secondaryCurrency,
        decimals: parseInt(decimals, 10),
        useGainLossColors: useColors,
      })
    } catch {
      // Mock fallback or update
    }
    await queryClient.invalidateQueries({ queryKey: ['bff', 'settings'] })
  }

  const handleDiscard = () => {
    setNameValue(initialName)
    setPrimaryCurrency(initialPrimaryCurrency)
    setSecondaryCurrency(initialSecondaryCurrency)
    setDecimals(initialDecimals)
    setUseColors(initialUseColors)
  }

  const navLinks = React.useMemo(
    () => [
      { href: '#profile', label: t('nav.profile') },
      { href: '#security', label: t('nav.security') },
      { href: '#currency', label: t('nav.currency') },
      { href: '#notifications', label: t('nav.notifications') },
      { href: '#fees', label: t('nav.fees') },
      { href: '#data', label: t('nav.data') },
    ],
    [t],
  )

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>
        {profile?.observedAt && <FreshnessStamp observedAt={profile.observedAt} />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 items-start">
        <nav className="sticky top-6 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="space-y-8">
          <ProfileSection
            section={profile}
            isLoading={isLoading}
            onRetry={refetch}
            nameValue={nameValue}
            onNameChange={setNameValue}
          />

          <SecuritySection
            section={sessions}
            isLoading={isLoading}
            onRetry={refetch}
          />

          <CurrencyFormatSection
            section={preferences}
            isLoading={isLoading}
            onRetry={refetch}
            primaryCurrency={primaryCurrency}
            onPrimaryCurrencyChange={setPrimaryCurrency}
            secondaryCurrency={secondaryCurrency}
            onSecondaryCurrencyChange={setSecondaryCurrency}
            decimals={decimals}
            onDecimalsChange={setDecimals}
            useColors={useColors}
            onUseColorsChange={setUseColors}
          />

          <NotificationsSection
            section={notificationPrefs}
            isLoading={isLoading}
            onRetry={refetch}
          />

          <FeesSection
            section={fees}
            isLoading={isLoading}
            onRetry={refetch}
          />

          <DataSection />
        </div>
      </div>

      {isDirty && <SaveBar isDirty={isDirty} onSave={handleSave} onDiscard={handleDiscard} />}
    </div>
  )
}
