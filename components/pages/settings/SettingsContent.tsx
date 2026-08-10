'use client'

import React, { useState } from 'react'
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
import type { BffQuery, SettingsBff } from '@/lib/api/bff/types'

export interface SettingsContentProps {
  query?: BffQuery
  initialData?: SettingsBff
}

export function SettingsContent({ query }: SettingsContentProps) {
  const queryClient = useQueryClient()
  const { data, isLoading, refetch } = useSettingsPage()

  const profileSection = data?.profile
  const securitySection = data?.security

  const [nameValue, setNameValue] = useState('Ana Pérez')
  const [secondaryCurrency, setSecondaryCurrency] = useState('none')
  const [decimals, setDecimals] = useState('2')
  const [useColors, setUseColors] = useState(true)
  const [paymentDue, setPaymentDue] = useState(true)
  const [budgetOverrun, setBudgetOverrun] = useState(true)

  const isDirty = nameValue !== 'Ana Pérez' || secondaryCurrency !== 'none' || decimals !== '2'

  const handleSave = async () => {
    await queryClient.invalidateQueries({ queryKey: ['bff', 'settings'] })
    setNameValue('Ana Pérez')
    setSecondaryCurrency('none')
    setDecimals('2')
  }

  const handleDiscard = () => {
    setNameValue('Ana Pérez')
    setSecondaryCurrency('none')
    setDecimals('2')
  }

  const navLinks = [
    { href: '#profile', label: 'Perfil' },
    { href: '#security', label: 'Seguridad' },
    { href: '#currency', label: 'Moneda y formato' },
    { href: '#notifications', label: 'Notificaciones' },
    { href: '#fees', label: 'Comisiones y costos' },
    { href: '#data', label: 'Datos' },
  ]

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ajustes</h1>
          <p className="text-sm text-muted-foreground">Preferencias de cuenta, seguridad y configuración</p>
        </div>
        {profileSection?.observedAt && <FreshnessStamp observedAt={profileSection.observedAt} />}
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
            section={profileSection}
            isLoading={isLoading}
            onRetry={refetch}
            nameValue={nameValue}
            onNameChange={setNameValue}
          />

          <SecuritySection
            section={securitySection}
            isLoading={isLoading}
            onRetry={refetch}
          />

          <CurrencyFormatSection
            secondaryCurrency={secondaryCurrency}
            onSecondaryCurrencyChange={setSecondaryCurrency}
            decimals={decimals}
            onDecimalsChange={setDecimals}
            useColors={useColors}
            onUseColorsChange={setUseColors}
          />

          <NotificationsSection
            paymentDue={paymentDue}
            onPaymentDueChange={setPaymentDue}
            budgetOverrun={budgetOverrun}
            onBudgetOverrunChange={setBudgetOverrun}
          />

          <FeesSection isLoading={isLoading} onRetry={refetch} />

          <DataSection />
        </div>
      </div>

      {isDirty && <SaveBar isDirty={isDirty} onSave={handleSave} onDiscard={handleDiscard} />}
    </div>
  )
}
