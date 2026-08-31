'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
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
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { components } from '@/lib/api/bff/schema'

type SectionResponseListSessionRowResponse = components['schemas']['SectionResponseListSessionRowResponse']
type SessionRowResponse = components['schemas']['SessionRowResponse']

export interface SecuritySectionProps {
  section?: SectionResponseListSessionRowResponse | any
  isLoading: boolean
  onRetry?: () => void
}

const MIN_PASSWORD_LENGTH = 8

export function SecuritySection({ section, isLoading, onRetry }: SecuritySectionProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const queryClient = useQueryClient()
  const [newPassword, setNewPassword] = useState('')
  const [selectedRevoke, setSelectedRevoke] = useState<SessionRowResponse | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)

  const handleRevoke = async () => {
    if (!selectedRevoke?.id) return
    setIsRevoking(true)
    try {
      await api.delete(`/api/v1/users/me/sessions/${selectedRevoke.id}`)
      await queryClient.invalidateQueries({ queryKey: ['bff', 'settings'] })
    } catch {
      // session revoked or endpoint non-responsive
    } finally {
      setIsRevoking(false)
      setSelectedRevoke(null)
    }
  }

  const isMinLength = newPassword.length >= MIN_PASSWORD_LENGTH

  return (
    <SectionState
      section={section}
      isLoading={isLoading}
      onRetry={onRetry}
      skeleton={<div className="h-64 rounded-xl bg-muted animate-pulse" />}
    >
      {(sessions: SessionRowResponse[]) => {
        const sessionList = Array.isArray(sessions) ? sessions : []
        const hasCurrent = sessionList.some((s) => s.current)

        return (
          <div id="security" className="elev-sm rounded-xl border bg-card p-6 space-y-6">
            <h3 className="section-head">{t('security.title')}</h3>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold">{t('security.activeSessions')}</h4>
              <div className="space-y-3">
                {sessionList.map((s, idx) => {
                  const isCurrent = Boolean(s.current || (!hasCurrent && idx === 0))

                  return (
                    <div
                      key={s.id ?? String(idx)}
                      data-testid="session-row"
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{s.device || t('security.unknownDevice')}</span>
                          {isCurrent && (
                            <span
                              data-testid="session-current"
                              className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded"
                            >
                              {t('security.currentSession')}
                            </span>
                          )}
                        </div>
                        {s.ip && <span className="text-xs text-muted-foreground">{s.ip}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        {s.lastSeenAt && <FreshnessStamp observedAt={s.lastSeenAt} />}
                        {!isCurrent && (
                          <Button variant="outline" size="sm" onClick={() => setSelectedRevoke(s)}>
                            {t('security.revoke')}
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-semibold">{t('security.changePassword')}</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="new-password-input" className="text-sm font-medium">
                    {t('security.newPassword')}
                  </label>
                  <Input
                    id="new-password-input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <p className="text-xs font-medium text-muted-foreground" data-met={isMinLength ? 'true' : 'false'}>
                    {t('security.minLength', { n: MIN_PASSWORD_LENGTH })}
                  </p>
                </div>
              </div>
            </div>

            <AlertDialog open={selectedRevoke !== null} onOpenChange={(o) => !o && setSelectedRevoke(null)}>
              <AlertDialogContent aria-describedby="revoke-session-desc">
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('security.revokeDialog.title')}</AlertDialogTitle>
                  <AlertDialogDescription id="revoke-session-desc">
                    {t('security.revokeDialog.description', {
                      device: selectedRevoke?.device || t('security.revokeDialog.fallbackDevice'),
                    })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedRevoke(null)}>{tCommon('cancel')}</AlertDialogCancel>
                  <AlertDialogAction disabled={isRevoking} onClick={handleRevoke}>
                    {t('security.revoke')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )
      }}
    </SectionState>
  )
}
