'use client'

import React, { useState } from 'react'
import { SectionState } from '@/components/ui-kit/feedback/SectionState'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FreshnessStamp } from '@/components/ui-kit/data/FreshnessStamp'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import type { Section } from '@/lib/api/bff/types'

export interface SessionItem {
  id: string
  device: string
  location: string
  ip: string
  lastSeenAt: string
  isCurrent: boolean
}

export interface SecuritySectionProps {
  section?: Section<{ mfaEnabled: boolean; lastPasswordChange: string }>
  isLoading: boolean
  onRetry?: () => void
}

export function SecuritySection({ section, isLoading, onRetry }: SecuritySectionProps) {
  const [newPassword, setNewPassword] = useState('')
  const [selectedRevoke, setSelectedRevoke] = useState<SessionItem | null>(null)

  const sessions: SessionItem[] = [
    { id: '1', device: 'Firefox · Linux', location: 'Buenos Aires', ip: '190.18.2.1', lastSeenAt: new Date().toISOString(), isCurrent: true },
    { id: '2', device: 'Chrome · Buenos Aires', location: 'Buenos Aires', ip: '190.18.2.5', lastSeenAt: new Date(Date.now() - 3600000).toISOString(), isCurrent: false },
  ]

  const isMinLength = newPassword.length >= 8

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
    >
      {() => (
        <div id="security" className="elev-sm rounded-xl border bg-card p-6 space-y-6">
          <h3 className="section-head">Seguridad y Sesiones</h3>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Sesiones Activas</h4>
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s.id} data-row className="flex items-center justify-between gap-3 p-3 rounded-lg border">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{s.device}</span>
                      {s.isCurrent && (
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                          Esta sesión
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{s.location} · {s.ip}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FreshnessStamp observedAt={s.lastSeenAt} />
                    {!s.isCurrent && (
                      <Button variant="outline" size="sm" onClick={() => setSelectedRevoke(s)}>
                        Cerrar sesión
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-semibold">Cambiar Contraseña</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="new-password-input" className="text-sm font-medium">Nueva contraseña</label>
                <Input
                  id="new-password-input"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <p className="text-xs font-medium text-muted-foreground" data-met={isMinLength ? 'true' : 'false'}>
                  Mínimo 8 caracteres
                </p>
              </div>
            </div>
          </div>

          <AlertDialog open={selectedRevoke !== null} onOpenChange={(o) => !o && setSelectedRevoke(null)}>
            <AlertDialogContent aria-describedby="revoke-session-desc">
              <AlertDialogHeader>
                <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                <AlertDialogDescription id="revoke-session-desc">
                  Se cerrará la sesión en {selectedRevoke?.device} ({selectedRevoke?.location}).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedRevoke(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => setSelectedRevoke(null)}>
                  Cerrar sesión
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </SectionState>
  )
}
