'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

export const MIN_PASSWORD_LENGTH = 8

export interface PasswordRulesProps {
  password?: string
}

export function PasswordRules({ password = '' }: PasswordRulesProps) {
  const t = useTranslations('auth')

  const rules = [
    {
      label: t('passwordRules.minLength', { n: MIN_PASSWORD_LENGTH }),
      met: password.length >= MIN_PASSWORD_LENGTH,
    },
    { label: t('passwordRules.uppercase'), met: /[A-Z]/.test(password) },
    { label: t('passwordRules.digit'), met: /[0-9]/.test(password) },
  ]

  return (
    <div role="status" aria-label={t('passwordRules.label')} className="space-y-1.5 pt-1">
      {rules.map((rule, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          <span
            data-met={rule.met ? 'true' : 'false'}
            className={`font-semibold ${rule.met ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}
          >
            {rule.met ? '✓' : '○'} {rule.label}
          </span>
        </div>
      ))}
    </div>
  )
}
