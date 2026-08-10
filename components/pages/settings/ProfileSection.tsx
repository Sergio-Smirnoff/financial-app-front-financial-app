'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import type { Section } from '@/lib/api/bff/types'

export interface ProfileData {
  email: string
  name: string
  preferredCurrency: string
}

export interface ProfileSectionProps {
  section?: Section<ProfileData>
  isLoading: boolean
  onRetry?: () => void
  nameValue: string
  onNameChange: (val: string) => void
}

export function ProfileSection({ section, isLoading, onRetry, nameValue, onNameChange }: ProfileSectionProps) {
  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-32 rounded-xl bg-muted animate-pulse" />}
    >
      {(profile) => (
        <div id="profile" className="elev-sm rounded-xl border bg-card p-6 space-y-4">
          <h3 className="section-head">Perfil de Usuario</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="email-input" className="text-sm font-medium">Correo Electrónico</label>
              <Input id="email-input" value={profile.email} disabled className="bg-muted" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="name-input" className="text-sm font-medium">Nombre</label>
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
