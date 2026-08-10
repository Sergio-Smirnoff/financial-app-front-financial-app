'use client'

import React from 'react'

export interface PasswordRulesProps {
  password?: string
}

export function PasswordRules({ password = '' }: PasswordRulesProps) {
  const rules = [
    { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { label: 'Una mayúscula', met: /[A-Z]/.test(password) },
    { label: 'Un número', met: /[0-9]/.test(password) },
  ]

  return (
    <div role="status" aria-label="Requisitos de contraseña" className="space-y-1.5 pt-1">
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
